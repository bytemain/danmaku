# bilibili 直播

## WebSocket 协议解析

<https://github.com/lovelyyoshino/Bilibili-Live-API/blob/master/API.WebSocket.md>

<https://www.bilibili.com/read/cv13055247/>

## 牌子颜色

获取到的牌子数据如下：

```txt
  [
    26,            'xxx',
    'xxxx-', ?,
    398668,        '',
    0,             6809855,
    398668,        6850801,
    3,             1,
    ?
  ],
```

已知 1 2 3 分别为 等级、牌子名称、牌子所属主播

4
5 渐变前颜色

(398668).toString(16) = 6154c
7 位 (6809855).toString(16) = 67e8ff border-color
9 位 (6850801).toString(16) = 6888f1 渐变后 color

```
border-color: #67e8ff
background-image: -o-linear-gradient(45deg, #06154c, #6888f1);background-image: -moz-linear-gradient(45deg, #06154c, #6888f1);background-image: -webkit-linear-gradient(45deg, #06154c, #6888f1);background-image: linear-gradient(45deg, #06154c, #6888f1);
```

10 可能是舰长的意思 0 不是舰长，3 是舰长, 2 是提督
11
