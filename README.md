# Hono + D1 + Drizzle のCRUDサンプル

## D1 + Drizzle 環境構築

1. パッケージインストール

```bash
bun add drizzle-orm
bun add -D drizzle-kit dotenv @types/node
```

2. D1にデータベースを作成

```bash
bun run wrangler d1 create todo
```

3. D1のセットアップウィザードに応答

```bash
✔ Would you like Wrangler to add it on your behalf? … yes
  → wrangler.jsonc に設定値を追記するか
✔ What binding name would you like to use? … todo
  → バインディング名はどうするか
✔ For local dev, do you want to connect to the remote resource instead of a local resource? … no
  → ローカル開発時に、ローカルのD1ではなく、リモートのD1に接続するか
```

4. バインディングの型定義を更新

```bash
bun run cf-typegen
```

5. Cloudflare の認証情報を .env ファイルに追記

```env
CLOUDFLARE_ACCOUNT_ID='CloudflareのアカウントID'
CLOUDFLARE_DATABASE_ID='wrangler.jsoncファイルに設定したdatabase_idと同じ値'
CLOUDFLARE_D1_TOKEN='Cloudflareダッシュボードで発行したAPIトークン'
```

6. drizzle.config.ts ファイルを作成

プロジェクトのルートディレクトリに drizzle.config.ts ファイルを作成する

7. tsconfig.json を編集する

`compilerOptions > types` に `"node"` を追記（`process.env`の型定義エラーを解消するため）

```json
    "types": [
      "./worker-configuration.d.ts",
+     "node"
    ]
```

8. wrangler.jsonc を編集

drizzle.config.ts の `out` に合わせる

```jsonc
	"d1_databases": [
		{
+			"migrations_dir": "drizzle"
		}
	]
```

9. スキーマファイルを作成

drizzle.config.ts の `schema` に記載のスキーマファイルを編集する

10. マイグレーションファイルを生成

```bash
bun run drizzle-kit generate
```

11. マイグレーションを適用

```bash
bun run wrangler d1 migrations apply todo --local
bun run wrangler d1 migrations apply todo --remote
```

12. シードファイルを作成

src > db > seed.sql

13. シードを適用

```bash
bun run wrangler d1 execute todo --local --file=./src/db/seed.sql
bun run wrangler d1 execute todo --remote --file=./src/db/seed.sql
```

13. テーブルを確認

- 開発環境: VScode拡張機能の`database client`でローカルのd1（`.wrangler/state/v3/d1/miniflare-D1DatabaseObject/xxx.sqlite`）をフルパスで開く
- 本番環境: `drizzle-kit studio`で確認 or cloudflare d1の管理者コンソールから確認

## FAQ

### Q.テーブルの構造が変わったら？

1. マイグレーションファイルを生成し直す（`bun run dz:generate`）
2. マイグレーションの適用を行う（`bun run db:migrate:local` & `bun run db:migrate:remote`）
3. シードファイルを更新する