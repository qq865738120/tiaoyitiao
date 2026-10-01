# view：阶段01模型基准

角色包装逻辑根位于脚底，Visual单独补偿原点；平台包装逻辑根位于台面，Visual水平缩放不改变高度。几何元数据使用设计的rect半宽5/circle半径5，不使用包含阴影的模型包围盒。

本模块仅保存可编辑映射与相机校准。动画和输入不在阶段01实现。模型引用使用AssetDB确认的Prefab/Mesh/Material/Texture子资源；原素材只读。
验证：Creator保存并重开包装Prefab与JumpMain，实际Preview检查头身纹理、脚底、阴影和+X/+Z构图。
