# jump材质副本目录

阶段01要求在独立目录制作材质副本，原GLB及导入材质只读。
本轮尚未发现具备材质复制/创建/公开属性编辑事务语义的工具；AssetManage仅支持导入/移动/meta更新等，不能创建材质副本。因此此目录目前不含伪造材质，GLB使用原已导入材质；透明阴影深度/UV校正仍为未完成项。

本目录现有 `gradient_5.png` 是从已确认原图经临时目录物化后，通过AssetManage import_external导入的独立背景副本，并非模型材质。根UUID `811d8dee-6136-4368-8378-0ecb1f1fa3fb`，Texture `@6c48a`、SpriteFrame `@f9941`；仅此副本设为sprite-frame及clamp-to-edge。原resources/jump不修改。JumpMain/Background使用该SpriteFrame渲染纵向渐变。

禁止用普通Write/Bash手写.mtl或修改Library。需Creator支持的材质工具后再制作副本、绑定包装Prefab、保存重开并实际Preview验证。
