# view：阶段02角色、平台与相机

AvatarView逻辑根为脚底，Visual基准offset=-rawFootY。蓄力压缩/空中旋转只作用Visual，根位置来自解析规则渲染插值；脚底局部补偿随压缩保持接触。ContactShadow停留于台面并随高度缩放，不用于碰撞。

PlatformView按PlatformSpec设置台面根/scale/矩形或圆元数据。PlatformPool复用阶段01包装，按精确Prefab引用替换模型，最多8包装，保留有限历史与预告；回收清metadata、Tween/回调、局部变换与材质实例，未使用共享材质修改。原GLB只读。

CameraFollow成功落地后按模拟tick在0.25秒平移，充能与飞行保持相机不变。对角正交角度/缩放固定，构图以当前/目标中点加既有offset；预告不要求全部可见。UI由场景Canvas负责。

验证：core独立几何/弹道测试；Creator真Preview检查两方向、脚底、压缩、阴影和下一目标完整可见；保存重开检查绑定。
