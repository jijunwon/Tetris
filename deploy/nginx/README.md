# Nginx (트래픽 관리)

운영 EC2의 `/etc/nginx/`에 반영한다. **로컬 Windows에는 Nginx가 없어도** 랭킹 캐시·429 안내는 앱만으로 동작한다.

## 파일

| 저장소 | 서버 경로 |
| --- | --- |
| `tetris-limits.conf` | `/etc/nginx/conf.d/tetris-limits.conf` |
| `tetris-proxy.conf` | `/etc/nginx/snippets/tetris-proxy.conf` |
| `tetris.conf` | `/etc/nginx/sites-available/tetris` |

## 적용

```bash
sudo mkdir -p /etc/nginx/snippets
sudo cp deploy/nginx/tetris-limits.conf /etc/nginx/conf.d/
sudo cp deploy/nginx/tetris-proxy.conf /etc/nginx/snippets/
sudo cp deploy/nginx/tetris.conf /etc/nginx/sites-available/tetris
sudo nginx -t && sudo systemctl reload nginx
```

이미 certbot이 만든 `server` 블록이 있으면, 그 안에 gzip·`limit_req`·`/assets/` 캐시 헤더만 옮겨 넣어도 된다. SSL 경로는 서버에 맞게 확인한다.
