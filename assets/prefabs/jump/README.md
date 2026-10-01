# jump包装Prefab

角色根为脚底接触点，平台根为台面中心；Visual负责原点补偿，水平scale与高度分离。Creator生成GLB子Prefab作为嵌套只读来源。封装脚本AvatarView/PlatformView仅保存映射与几何元数据，不建立物理碰撞。

保存和复验：Creator DocumentSave/DocumentOpen；JumpMain实际预览。原GLB不修改，禁止手写Prefab序列化。
