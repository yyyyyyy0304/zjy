# zhang_database.md

<!--
姓名：【张婧雅】 | 学号：【24005240115】 | 时间：2026-11-09 | 大模型：DeepSeek-V4.1-Flash
-->

本文件按执行顺序记录所有建库、建表、改表与测试数据 SQL，**只追加，不覆盖**。
仅凭本文件即可在新机器上完整重建数据库。

---

## 1. 创建数据库（2026-11-09 16:18:00）

```sql
CREATE DATABASE IF NOT EXISTS zhang_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

---

## 2. 创建科技新闻表 zhang_news（2026-11-09 16:35:00）

```sql
CREATE TABLE IF NOT EXISTS zhang_news (
  zhang_id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '新闻ID',
  zhang_title VARCHAR(200) NOT NULL COMMENT '标题',
  zhang_category VARCHAR(50) NOT NULL COMMENT '分类',
  zhang_summary VARCHAR(500) NOT NULL COMMENT '摘要',
  zhang_content TEXT NOT NULL COMMENT '正文',
  zhang_source VARCHAR(100) NOT NULL COMMENT '来源',
  zhang_author VARCHAR(50) NOT NULL COMMENT '作者',
  zhang_views INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '浏览量',
  zhang_publish_time DATETIME NOT NULL COMMENT '发布时间',
  zhang_create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (zhang_id),
  KEY zhang_idx_publish_time (zhang_publish_time),
  KEY zhang_idx_category (zhang_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='科技新闻表';
```

---

## 3. 插入测试数据 zhang_news（2026-11-09 16:35:00）

```sql
INSERT INTO zhang_news (zhang_title, zhang_category, zhang_summary, zhang_content, zhang_source, zhang_author, zhang_views, zhang_publish_time) VALUES
('国产大模型开源生态加速，多款推理模型同步发布', '人工智能', '本周多家国内厂商集中开源推理模型，参数规模覆盖 7B 至 200B，均支持长上下文与工具调用，社区下载量快速攀升。', '开源模型正在从“能跑”转向“好用”，量化部署与推理加速工具链的完善是关键推动力。', '科技日报', '李明', 5821, '2026-11-09 09:20:00'),
('新一代国产 GPU 量产，单卡显存带宽提升 45%', '芯片', '某国产 GPU 厂商宣布新一代数据中心加速卡进入量产阶段，显存带宽较上代提升 45%，重点优化大模型推理场景。', '该卡采用新架构与高带宽显存，配合自研编译器，可在主流推理框架下直接调度，官方称推理吞吐提升约 1.8 倍。', '芯东西', '王瑞', 4310, '2026-11-08 16:05:00'),
('量子计算原型机实现 512 比特纠缠，纠错成本下降', '量子计算', '研究团队在超导量子平台上实现 512 比特纠缠态制备，逻辑错误率降低至此前方案的三分之一。', '团队通过改进耦合器设计与动态校准流程，显著抑制了退相干影响，为容错量子计算路径提供了新的工程参考。', '中国科学报', '陈立', 2987, '2026-11-08 10:42:00'),
('端侧 AI 芯片出货量创新高，手机 NPU 算力翻倍', '芯片', '第三方机构数据显示，三季度端侧 AI 芯片出货同比增长 38%，主流手机 NPU 算力普遍达到上代两倍。', '端侧推理需求由图像增强扩展到实时翻译与语音助手，厂商开始在能效比上展开竞争。', '集微网', '赵倩', 3654, '2026-11-07 14:30:00'),
('开源框架发布 3.0 版本，全面支持异构算力调度', '软件工程', '该框架 3.0 版本重构了调度内核，可同时管理 CPU、GPU 与 NPU 资源，并新增流水线并行策略。', '新版本在千卡规模训练任务中将资源空转率降低约 22%，同时保持了向后兼容的 API。', 'InfoQ 中文', '孙浩', 2104, '2026-11-07 09:15:00'),
('智能驾驶数据闭环平台上线，标注效率提升 3 倍', '智能驾驶', '某车企上线自研数据闭环平台，打通车端采集、自动标注与模型回灌流程，标注环节人效提升约 3 倍。', '平台引入半监督预标注与主动学习策略，优先挑选高价值场景，使模型迭代周期由两周缩短至五天。', '汽车之心', '周涛', 1876, '2026-11-06 18:00:00'),
('云厂商下调对象存储价格，冷数据归档成本再降', '云计算', '多家云厂商本周同步下调对象存储与归档存储单价，冷数据长期保存成本下降约 30%。', '降价主要集中在低频与归档层级，配套的数据分层迁移工具也一并升级，便于用户按访问频率自动迁移。', '云头条', '吴迪', 1542, '2026-11-06 11:25:00'),
('RISC-V 服务器芯片完成首轮流片，主频达 2.8GHz', '芯片', '一款面向服务器场景的 RISC-V 芯片完成首轮流片，16 核设计主频 2.8GHz，已通过基础功能验证。', '该芯片支持向量扩展与多级缓存一致性协议，团队下一步将完善操作系统与编译工具链适配。', '半导体行业观察', '郑凯', 1320, '2026-11-05 15:40:00'),
('工业缺陷检测模型落地，误检率降至千分之三', '智能制造', '某制造企业部署视觉缺陷检测模型，在产线实测中误检率降至千分之三，单线日均检出缺陷件 120 余件。', '方案采用小样本迁移训练与在线增量更新，解决了新产品上线初期样本不足的问题。', '机器之心', '何静', 1105, '2026-11-05 08:50:00'),
('浏览器引擎更新，页面渲染功耗下降 15%', '软件工程', '主流浏览器引擎发布新版本，通过合成层优化与解码调度调整，视频与动画场景功耗下降约 15%。', '更新还改进了 Canvas 绘制路径，在复杂动画页面中掉帧率明显减少，移动端收益尤其明显。', '前端之巅', '林可', 980, '2026-11-04 17:10:00');
```

---

## 4. 创建农产品图文表 zhang_produce（2026-11-09 17:05:00）

```sql
CREATE TABLE IF NOT EXISTS zhang_produce (
  zhang_id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '农产品ID',
  zhang_name VARCHAR(100) NOT NULL COMMENT '名称',
  zhang_category VARCHAR(50) NOT NULL COMMENT '分类',
  zhang_price DECIMAL(10,2) NOT NULL COMMENT '单价（元）',
  zhang_unit VARCHAR(20) NOT NULL COMMENT '计价单位',
  zhang_origin VARCHAR(100) NOT NULL COMMENT '产地',
  zhang_desc VARCHAR(500) NOT NULL COMMENT '描述',
  zhang_image VARCHAR(600) NOT NULL COMMENT '图片地址',
  zhang_stock INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '库存',
  zhang_create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (zhang_id),
  KEY zhang_idx_category (zhang_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='农产品图文表';
```

---

## 5. 插入测试数据 zhang_produce（2026-11-09 17:05:00）

图片地址为文生图接口生成的网络图片（prompt 经 URL 编码，image_size=landscape_4_3），也可替换为本地 `frontend/images/` 下的图片路径。

```sql
INSERT INTO zhang_produce (zhang_name, zhang_category, zhang_price, zhang_unit, zhang_origin, zhang_desc, zhang_image, zhang_stock) VALUES
('有机番茄', '时令蔬菜', 12.80, '斤', '山东寿光', '温室有机种植，自然成熟采摘，果肉沙甜多汁，适合生食与炒制。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20organic%20red%20tomatoes%20on%20a%20rustic%20wooden%20table%2C%20natural%20sunlight%2C%20photorealistic%20food%20photography&image_size=landscape_4_3', 320),
('春笋', '时令蔬菜', 18.50, '斤', '浙江临安', '清明前后现挖春笋，笋肉洁白脆嫩，清炒或炖汤都鲜甜。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20bamboo%20shoots%20freshly%20dug%20with%20soil%2C%20green%20bamboo%20forest%20background%2C%20natural%20light%2C%20photorealistic&image_size=landscape_4_3', 150),
('徐香猕猴桃', '时令水果', 9.90, '斤', '陕西眉县', '果肉翠绿细腻，酸甜适中，富含维生素 C，常温放软后风味更佳。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ripe%20kiwi%20fruits%20sliced%20showing%20green%20flesh%20on%20wooden%20board%2C%20soft%20natural%20light%2C%20photorealistic&image_size=landscape_4_3', 480),
('散养土鸡蛋', '禽蛋水产', 1.80, '枚', '河南信阳', '山地散养母鸡所产，蛋黄橙红饱满，腥味轻，适合蒸蛋与烘焙。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20brown%20free%20range%20eggs%20in%20a%20woven%20basket%20on%20farm%20table%2C%20warm%20natural%20light%2C%20photorealistic&image_size=landscape_4_3', 1200),
('赣南脐橙', '时令水果', 6.50, '斤', '江西赣州', '果皮橙亮易剥，果肉化渣多汁，甜度可达 15 度，冬季当季首选。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20navel%20oranges%20with%20green%20leaves%20piled%20in%20wooden%20crate%2C%20orchard%20background%2C%20photorealistic&image_size=landscape_4_3', 860),
('东北黑木耳', '山珍干货', 38.00, '斤', '黑龙江牡丹江', '段木栽培，耳片厚实，泡发率高，凉拌或小炒口感爽脆。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dried%20black%20fungus%20wood%20ear%20mushrooms%20in%20a%20ceramic%20bowl%2C%20rustic%20kitchen%20table%2C%20natural%20light%2C%20photorealistic&image_size=landscape_4_3', 210),
('五常大米', '粮油米面', 7.60, '斤', '黑龙江五常', '当季新米，颗粒饱满，蒸煮后油亮清香，冷饭不易回生。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20raw%20jasmine%20rice%20grains%20in%20a%20wooden%20scoop%2C%20burlap%20sack%20background%2C%20soft%20light%2C%20photorealistic&image_size=landscape_4_3', 540),
('高山土蜂蜜', '山珍干货', 68.00, '瓶', '云南怒江', '海拔 2000 米以上蜜源，自然成熟封盖取蜜，质地浓稠带花香。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=raw%20honey%20dripping%20from%20wooden%20honey%20dipper%20into%20glass%20jar%2C%20warm%20sunlight%2C%20photorealistic&image_size=landscape_4_3', 96),
('紫薯', '时令蔬菜', 5.20, '斤', '广西桂林', '紫皮紫心，蒸熟后绵密香甜，富含花青素，适合做主食与甜品。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20purple%20sweet%20potatoes%20with%20soil%20on%20wooden%20table%2C%20natural%20light%2C%20photorealistic%20food%20photography&image_size=landscape_4_3', 430),
('阳光玫瑰青提', '时令水果', 22.00, '斤', '云南宾川', '无籽脆甜，带淡淡玫瑰香气，果粒饱满，冷链直发。', 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bunches%20of%20green%20shine%20muscat%20grapes%20on%20vine%2C%20sunlight%20through%20leaves%2C%20photorealistic&image_size=landscape_4_3', 260);
```

---

## 6. 创建语音识别记录表 zhang_voice_record（2026-11-16 16:40:00）

```sql
CREATE TABLE IF NOT EXISTS zhang_voice_record (
  zhang_id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  zhang_filename VARCHAR(255) NOT NULL COMMENT '音频文件名',
  zhang_text VARCHAR(2000) NOT NULL COMMENT '语音识别文本',
  zhang_language VARCHAR(30) NOT NULL DEFAULT '' COMMENT '识别语种',
  zhang_duration DECIMAL(8,2) NOT NULL DEFAULT 0 COMMENT '音频时长（秒）',
  zhang_model VARCHAR(100) NOT NULL COMMENT '语音识别模型',
  zhang_intent VARCHAR(30) NOT NULL DEFAULT '' COMMENT '客服意图',
  zhang_keywords VARCHAR(300) NOT NULL DEFAULT '' COMMENT '关键词（顿号分隔）',
  zhang_reply VARCHAR(500) NOT NULL DEFAULT '' COMMENT '建议回复',
  zhang_confidence DECIMAL(4,2) NOT NULL DEFAULT 0 COMMENT '意图置信度',
  zhang_create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '记录时间',
  PRIMARY KEY (zhang_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='语音识别记录表';
```

---

## 7. 插入测试数据 zhang_voice_record（2026-11-16 16:40:00）

```sql
INSERT INTO zhang_voice_record (zhang_filename, zhang_text, zhang_language, zhang_duration, zhang_model, zhang_intent, zhang_keywords, zhang_reply, zhang_confidence) VALUES
('语音样例-产品介绍.mp3', '欢迎来到田园优选。今天向大家推荐两款当季农产品：山东寿光的有机番茄，沙甜多汁；浙江临安的春笋，脆嫩鲜甜。产地直供，冷链配送，二十四小时内发货。', 'Chinese', 15.00, 'Qwen/Qwen3-ASR-1.7B', '商品咨询', '有机番茄、春笋、冷链配送', '这两款都是当季新品，有机番茄 12.8 元/斤、春笋 18.5 元/斤，满 99 元全国包邮。', 0.93),
('语音样例-订单查询.mp3', '你好，我昨天下午下的订单，订单号是 20261115008，想问一下什么时候能发货？', 'Chinese', 9.00, 'Qwen/Qwen3-ASR-1.7B', '物流查询', '订单号 20261115008、发货时间', '您的订单已进入打包环节，预计今天 18 点前发出，发出后可在“我的订单”查看物流轨迹。', 0.95),
('语音样例-售后咨询.mp3', '我收到的番茄有两个压坏了，这个可以退换吗？需要我拍照给你们吗？', 'Chinese', 11.00, 'Qwen/Qwen3-ASR-1.7B', '售后问题', '番茄、压坏、退换、拍照', '抱歉给您带来不便，请在收货 48 小时内提供照片，我们可为您全额退款或补发。', 0.96),
('录音-20261116-101530.webm', '我想买五斤高山土蜂蜜，能不能便宜一点，能不能开发票？', 'Chinese', 8.00, 'Qwen/Qwen3-ASR-1.7B', '下单购买', '高山土蜂蜜、五斤、发票', '土蜂蜜 68 元/斤，5 斤可享会员 95 折，支持开具电子发票，下单时备注即可。', 0.88),
('录音-20261116-102245.webm', '你们的大米是哪里产的，是不是今年的新米？', 'Chinese', 6.00, 'Qwen/Qwen3-ASR-1.7B', '商品咨询', '大米、产地、新米', '我们的大米来自黑龙江五常，当季新米，颗粒饱满，可扫码查看产地与检测报告。', 0.91),
('录音-20261116-110012.webm', '我想问一下，能不能明天上午送到，我上午在家。', 'Chinese', 5.00, 'Qwen/Qwen3-ASR-1.7B', '物流查询', '明天上午、送达时间', '可以，下单时在备注中注明期望送达时间，我们会尽量为您安排上午配送。', 0.86),
('录音-20261116-141020.webm', '这个春笋要怎么保存，冰箱里能放几天？', 'Chinese', 7.00, 'Qwen/Qwen3-ASR-1.7B', '商品咨询', '春笋、保存、冷藏', '建议带壳冷藏保存，3 天内食用口感最佳，焯水后冷冻可延长至一周。', 0.90),
('录音-20261116-152238.webm', '你们支持货到付款吗？我想收到再付钱。', 'Chinese', 6.00, 'Qwen/Qwen3-ASR-1.7B', '其他', '货到付款、支付方式', '目前支持微信、支付宝与银行卡支付，暂不支持货到付款，感谢理解。', 0.84);
```

---

## 8. 创建图像识别记录表 zhang_vision_record（2026-11-16 16:40:00）

```sql
CREATE TABLE IF NOT EXISTS zhang_vision_record (
  zhang_id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  zhang_filename VARCHAR(255) NOT NULL COMMENT '图片文件名',
  zhang_name VARCHAR(100) NOT NULL DEFAULT '' COMMENT '主体名称',
  zhang_category VARCHAR(30) NOT NULL DEFAULT '' COMMENT '品类',
  zhang_items VARCHAR(300) NOT NULL DEFAULT '' COMMENT '识别到的物品（顿号分隔）',
  zhang_freshness VARCHAR(20) NOT NULL DEFAULT '' COMMENT '新鲜度判断',
  zhang_description VARCHAR(1000) NOT NULL DEFAULT '' COMMENT '图片描述',
  zhang_tags VARCHAR(300) NOT NULL DEFAULT '' COMMENT '标签（顿号分隔）',
  zhang_confidence DECIMAL(4,2) NOT NULL DEFAULT 0 COMMENT '识别置信度',
  zhang_model VARCHAR(100) NOT NULL COMMENT '图像识别模型',
  zhang_create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '记录时间',
  PRIMARY KEY (zhang_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='图像识别记录表';
```

---

## 9. 插入测试数据 zhang_vision_record（2026-11-16 16:40:00）

```sql
INSERT INTO zhang_vision_record (zhang_filename, zhang_name, zhang_category, zhang_items, zhang_freshness, zhang_description, zhang_tags, zhang_confidence, zhang_model) VALUES
('示例图片-有机番茄.jpg', '有机番茄', '新鲜果蔬', '红番茄', '新鲜', '木桌上摆放着数个鲜红饱满的番茄，带绿色蒂头，表面有光泽，背景为模糊的田园景致。', '番茄、有机、时令蔬菜', 0.95, 'Qwen/Qwen3-VL-8B-Instruct'),
('示例图片-蔬菜包装箱.jpg', '蔬菜包装箱', '包装物料', '青菜、胡萝卜、番茄、玉米、瓦楞纸箱', '新鲜', '一个装满新鲜蔬菜的瓦楞纸箱，箱内可见青菜、胡萝卜、番茄与玉米，箱体印有绿色农场标签。', '蔬菜礼盒、包装箱、冷链配送', 0.93, 'Qwen/Qwen3-VL-8B-Instruct'),
('图片-春笋.jpg', '春笋', '新鲜果蔬', '春笋', '新鲜', '几根刚挖出的春笋摆放在竹篮中，笋壳呈黄褐色，笋尖紧实，带有泥土气息。', '春笋、山货、当季', 0.92, 'Qwen/Qwen3-VL-8B-Instruct'),
('图片-五常大米.jpg', '五常大米', '五谷粮油', '大米、包装袋', '无法判断', '一袋真空包装的大米，包装袋上印有产地与稻花香字样，米粒饱满透亮。', '大米、五常、粮油', 0.90, 'Qwen/Qwen3-VL-8B-Instruct'),
('图片-高山土蜂蜜.jpg', '高山土蜂蜜', '山珍干货', '蜂蜜罐、蜂蜜', '无法判断', '玻璃罐装琥珀色蜂蜜置于木质台面，旁边放着蜂巢与木质勺，光线温暖。', '土蜂蜜、蜂产品、山珍', 0.91, 'Qwen/Qwen3-VL-8B-Instruct'),
('图片-散养土鸡蛋.jpg', '散养土鸡蛋', '生鲜肉类', '土鸡蛋、蛋托', '新鲜', '竹制蛋托中整齐摆放着褐色土鸡蛋，蛋壳表面干净，个头均匀。', '土鸡蛋、散养、生鲜', 0.94, 'Qwen/Qwen3-VL-8B-Instruct'),
('图片-冷链仓库.jpg', '冷链仓库', '其他', '货架、周转箱、制冷设备', '无法判断', '冷库内整齐排列的货架与周转箱，箱内码放着待发货的生鲜农产品。', '冷链、仓储、物流', 0.87, 'Qwen/Qwen3-VL-8B-Instruct'),
('图片-产品宣传海报.jpg', '产品宣传海报', '其他', '海报、文字、农产品图案', '无法判断', '一张农产品促销海报，画面包含番茄与春笋图案及促销文字，属于营销物料。', '海报、营销物料、设计', 0.85, 'Qwen/Qwen3-VL-8B-Instruct');
```

---

## 10. 创建用户表 zhang_user（2026-11-19 15:55:00）

```sql
CREATE TABLE IF NOT EXISTS zhang_user (
  zhang_id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户主键',
  zhang_username VARCHAR(50) NOT NULL COMMENT '登录用户名',
  zhang_password VARCHAR(255) NOT NULL COMMENT 'scrypt 加盐哈希后的密码',
  zhang_nickname VARCHAR(50) NOT NULL DEFAULT '' COMMENT '昵称',
  zhang_email VARCHAR(100) NOT NULL DEFAULT '' COMMENT '邮箱',
  zhang_create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
  zhang_last_login_time DATETIME NULL DEFAULT NULL COMMENT '最近登录时间',
  PRIMARY KEY (zhang_id),
  UNIQUE KEY zhang_uk_username (zhang_username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='用户表';
```

---

## 11. 插入测试数据 zhang_user（2026-11-19 15:55:00）

```sql
INSERT INTO zhang_user (zhang_username, zhang_password, zhang_nickname, zhang_email, zhang_create_time, zhang_last_login_time) VALUES
('farmer01', 'scrypt$417d205e7808d1259bcf639513155486$1932fabfa758e585322614e0f18cab339e6b27510ae627e4e38f2cda92a50a0f38a433da090e316168df50fc55edf24feaf560e02ef7d6f8cfb322b01a927595', '田间老张', 'farmer01@zhangfarm.cn', DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
('lixiaoyu', 'scrypt$50ec65db4769dd501742cb52d6e46ad4$e4834bd774570d5900b7333783bded4bd627908a21ac2bd306689f33a2c62ae417b2e0c4ce7b4d5380d0fd73b6f878256146db2e1e6046d10b050ad358f7d6e6', '李晓雨', 'lixiaoyu@zhangfarm.cn', DATE_SUB(NOW(), INTERVAL 26 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
('wangdachu', 'scrypt$aa24df14782e8bd02a1d932f8aaf4112$e443a84d1071cd0cc6cb7d94a8e28c4098b8495155e6b2e5a61d0e6b7a89303fe18e02167d327ea4e6bcd235446d88c316e06250dd55a8cb08e579288b001412', '王大厨', 'wangdachu@zhangfarm.cn', DATE_SUB(NOW(), INTERVAL 21 DAY), DATE_SUB(NOW(), INTERVAL 0 DAY)),
('chenguo', 'scrypt$0428416fd7d8866ed26b97b3bdb63913$4085f46b701bd3f1d5f11cbd2c4329c35d3f99889c7490525595a6442f1ad8ea05e93d295a67c2c59be2f438317a7595d15b1e4290f99a6d87214010e234dfe0', '陈果', 'chenguo@zhangfarm.cn', DATE_SUB(NOW(), INTERVAL 16 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY)),
('zhaomiao', 'scrypt$a8ecab64041584a4c1325ad0e434e4b7$3f23af4c2e8c95b90ba61ae0d1523d5e72ccfb1e49f6e93425cedff7e1e4973c0c27695c9c618b517dd990e92bc279490b51f57001bd2d1816bbb92289f0d553', '赵苗', 'zhaomiao@zhangfarm.cn', DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
('sunny_liu', 'scrypt$a78036470409c3bedbb0bba35a01ea9a$d4d8280efede696b1f71afa048fd1a5981573baa2ed9c4ab7e0a3fef5bb8a7c0be236791428559bb24a8d873f3a303cf141bebe7f6d76a569466e0c54ec8e9fc', '刘晴', 'sunny_liu@zhangfarm.cn', DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
('hefang', 'scrypt$b05c6fbe26519e41c750af13aa25d038$0cbf4f02073a44ef092b5a39265883825fe25b75677ea46e7abca51c76f053e28b62707739def8b72838d9e156ffcbf71f89eb28bf47adba20a5c3eb2c721c6b', '何方', 'hefang@zhangfarm.cn', DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
('zhang_admin', 'scrypt$32fc912f93125e93a77e16772e1d5783$720d0f27d48f2be7a6e223cf8cb35bc7fafa056117221ec158a97bcc7628348a2ee8f9aa50114b62b958ac0c8ecc2347b912abf291249375b8d40d8434c618d9', '站务小田', 'admin@zhangfarm.cn', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 0 DAY));
```

- 说明：8 个测试账号的登录密码统一为 `zhang123456`（符合 8-20 位且含字母与数字的规则），数据库中保存的是 scrypt 加盐哈希，无法反推明文。

---

## 12. 创建管理员表 zhang_admin（2026-11-19 16:28:00）

```sql
CREATE TABLE IF NOT EXISTS zhang_admin (
  zhang_id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '管理员ID',
  zhang_username VARCHAR(50) NOT NULL COMMENT '登录用户名',
  zhang_password VARCHAR(255) NOT NULL COMMENT 'scrypt 加盐哈希后的密码',
  zhang_realname VARCHAR(50) NOT NULL DEFAULT '' COMMENT '姓名',
  zhang_role VARCHAR(50) NOT NULL DEFAULT 'admin' COMMENT '角色',
  zhang_status TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1 启用，0 停用',
  zhang_create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  zhang_last_login_time DATETIME NULL DEFAULT NULL COMMENT '最近登录时间',
  PRIMARY KEY (zhang_id),
  UNIQUE KEY zhang_uk_admin_username (zhang_username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='管理员表';
```

---

## 13. 插入测试数据 zhang_admin（2026-11-19 16:28:00）

```sql
INSERT INTO zhang_admin (zhang_username, zhang_password, zhang_realname, zhang_role, zhang_status, zhang_create_time, zhang_last_login_time) VALUES
('zhang_admin', 'scrypt$e9cc3d887f36a7a01fe3962a98278d09$d60fc1d59453440a297fcc776dbbfd79a0a3ba0fbd2bfc3e99eb77cc333a3479370a6ddfb6b2f66ecd0a6ac54df63962798a4ef0cb21909f0d6a32b18ca396ff', '张婧雅', '超级管理员', 1, DATE_SUB(NOW(), INTERVAL 60 DAY), NOW()),
('admin_liu', 'scrypt$f9492bfc64b24207e28245079dff362c$a3a4c1dc81c3c043f601a3809b6d31a7a5b14b7b32cb6d42798e8177127dcbfb460f3a8ed1bcc79e4f747cf81e4593a626a5aa8825fcff1368138c51586af78e', '刘敏', '内容运营', 1, DATE_SUB(NOW(), INTERVAL 55 DAY), NULL),
('admin_wang', 'scrypt$020009090db414c0745451f8b201958a$4e6d5d792980eceffa85e7d3f5da149e17b6529c8646c63f68a9105fc5a030fc6a0241216f7ee7fc96c4a062b968f4be037ef173ca3c007e90efc8c5b315125c', '王强', '商品运营', 1, DATE_SUB(NOW(), INTERVAL 50 DAY), NULL),
('admin_chen', 'scrypt$eb797f9df500a3347b2a86941973ff0e$aeb0ebdd74c92f5cc3825f1e32a84b91f623d8354c8f18b3343e72590b92e6c999165d980cfd89a948745488ad63c03cb9c0c12af8c6248de71df612bdf6b7c2', '陈曦', '用户运营', 1, DATE_SUB(NOW(), INTERVAL 45 DAY), NULL),
('admin_zhao', 'scrypt$9342ff7efc6e5dc060cd3fd7a9e5ee07$05399af4ac23b7479f9c6689ae4d1ad3fee8716913f29598c851ee27172657fb9d1ca53ca2cd2859b1caa1683e3e37c70ef4a74f2f35cf595b5f9d7cd584f05b', '赵磊', '数据分析', 1, DATE_SUB(NOW(), INTERVAL 40 DAY), NULL),
('admin_sun', 'scrypt$12ce5f1b2c73ee3f32875a1202052621$20045e59c8d54b5315dd777ffe9537cdc8d3a4d3674ec1aaef38fcb7949bb505e5a950feb2bc808b4aa1e03603862e7a165f7eb9072494fe8d898cecfce55d97', '孙悦', '内容审核', 1, DATE_SUB(NOW(), INTERVAL 35 DAY), NULL),
('admin_he', 'scrypt$797ff40b506d407e6c918d652b013eb4$ec888ba10e4ba03146ed6457a50cd3f82a3be9dc0f291bc15c91d511a3c1342ad751da21948d9b0e4ae05e81abfda6ab9410f096ff3f2b9025ae8de74c6a57ee', '何方', '订单客服', 1, DATE_SUB(NOW(), INTERVAL 30 DAY), NULL),
('admin_lin', 'scrypt$020cbf831eaf4ffa34442e65bd922152$9ed7e2dbb234705689c111ba97892e70338ac3dd0cc9f506dd5a2a1d922e15ecb8f434a526d32244d7c0c0b248e9dc45bc1f0521293b9e1ea35af7957476eee6', '林可', '系统维护', 1, DATE_SUB(NOW(), INTERVAL 25 DAY), NULL);
```

- 说明：8 个管理员账号的登录密码统一为 `admin123456`，数据库中保存 scrypt 加盐哈希。

---

## 14. Supabase 鉴权联调测试数据 zhang_user（2026-11-23 15:49:00）

```sql
-- 由 Supabase 登录成功后自动同步写入本地用户表，密码为 RandomBytes 生成的 scrypt 加盐哈希（仅联调用测试账号）
INSERT INTO zhang_user (zhang_username, zhang_password, zhang_nickname, zhang_email, zhang_create_time, zhang_last_login_time)
VALUES ('supatestuser', '<随机 scrypt 加盐哈希>', '测试用户', 'supatest@zhangfarm.cn', NOW(), NOW());
```

- 说明：该行由 `POST /api/auth/supabase/login` 首次登录时自动创建，用户名为邮箱前缀 `supatest` 去掉特殊字符并追加 `user`；此处仅记录表结构与数据来源，便于复现，不包含真实密码哈希。

---
