from __future__ import annotations

import hashlib
import json
import os
import socket
import time
from pathlib import Path
from typing import Any, Dict, Optional


def _stable_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), sort_keys=True)


class WorkflowScriptContextClient:
    def __init__(self, descriptor: Dict[str, Any], cwd: Path):
        self._descriptor = descriptor
        self._cwd = cwd.resolve()
        self._sequence = 0

    def call(
        self,
        method: str,
        params: Optional[Any] = None,
        timeout_seconds: float = 30.0,
        wait_policy: Optional[str] = None,
    ) -> Any:
        durable_wait = wait_policy == "durable"
        self._sequence += 1
        unsigned: Dict[str, Any] = {
            "version": 1,
            "requestId": f"sdk_{int(time.time() * 1000)}_{self._sequence}",
            "sequence": self._sequence,
            "deadlineAt": 0 if durable_wait else int(time.time() * 1000) + min(max(int(timeout_seconds * 1000), 1), 60000),
            "identity": self._descriptor["identity"],
            "method": method,
        }
        if durable_wait:
            unsigned["waitPolicy"] = "durable"
        if params is not None:
            unsigned["params"] = params
        request = dict(unsigned)
        request["requestDigest"] = hashlib.sha256(_stable_json(unsigned).encode("utf-8")).hexdigest()
        body = _stable_json(request).encode("utf-8")
        headers = (
            f"POST {self._descriptor['requestPath']} HTTP/1.1\r\n"
            "Host: workflow-context\r\n"
            f"Authorization: Bearer {self._descriptor['token']}\r\n"
            "Content-Type: application/json\r\n"
            f"Content-Length: {len(body)}\r\n"
            "Connection: close\r\n\r\n"
        ).encode("ascii")
        transport = self._descriptor.get("transport")
        if transport == "unix-socket":
            channel: Any = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
            channel.settimeout(None if durable_wait else timeout_seconds)
            channel.connect(self._descriptor["socketPath"])
            stream = channel.makefile("rwb", buffering=0)
        elif transport == "named-pipe" and os.name == "nt":
            channel = None
            stream = open(self._descriptor["socketPath"], "r+b", buffering=0)
        else:
            raise RuntimeError("WORKFLOW_CONTEXT_TRANSPORT_UNSUPPORTED")
        try:
            stream.write(headers + body)
            raw = bytearray()
            while len(raw) <= 1024 * 1024:
                chunk = stream.read(65536)
                if not chunk:
                    break
                raw.extend(chunk)
            if len(raw) > 1024 * 1024:
                raise RuntimeError("WORKFLOW_CONTEXT_RESPONSE_LIMIT")
        finally:
            stream.close()
            if channel is not None:
                channel.close()
        head, separator, response_body = bytes(raw).partition(b"\r\n\r\n")
        if not separator:
            raise RuntimeError("WORKFLOW_CONTEXT_RESPONSE_INVALID")
        status_line = head.split(b"\r\n", 1)[0].decode("ascii", errors="replace")
        payload = json.loads(response_body.decode("utf-8"))
        if " 200 " not in status_line or not payload.get("ok"):
            raise RuntimeError(payload.get("code", "WORKFLOW_CONTEXT_CALL_FAILED"))
        return payload.get("result")

    def call_durable(self, method: str, params: Optional[Any] = None) -> Any:
        return self.call(method, params, timeout_seconds=0, wait_policy="durable")

    def process_image(self, request: Dict[str, Any]) -> Any:
        """Call the public image processor with a bounded ordinary deadline."""
        return self.call("processImage", request, timeout_seconds=60)

    def invoke_agent(self, agent_id: str, request: Dict[str, Any], output_name: str) -> Any:
        return self.call_durable(
            "invokeAgent",
            {"agentId": agent_id, "request": request, "outputName": output_name},
        )

    def resolve_attempt_path(self, relative_path: str) -> Path:
        if not isinstance(relative_path, str) or Path(relative_path).is_absolute():
            raise RuntimeError("WORKFLOW_CONTEXT_PATH_INVALID")
        resolved = (self._cwd / relative_path).resolve()
        try:
            resolved.relative_to(self._cwd)
        except ValueError as error:
            raise RuntimeError("WORKFLOW_CONTEXT_PATH_INVALID") from error
        return resolved


def create_workflow_script_context_client(cwd: Optional[Path] = None) -> WorkflowScriptContextClient:
    resolved_cwd = Path.cwd().resolve() if cwd is None else Path(cwd).resolve()
    descriptor = json.loads((resolved_cwd / ".workflow-context.json").read_text(encoding="utf-8"))
    if descriptor.get("version") != 1 or descriptor.get("requestPath") != "/v1/call":
        raise RuntimeError("WORKFLOW_CONTEXT_DESCRIPTOR_INVALID")
    return WorkflowScriptContextClient(descriptor, resolved_cwd)
