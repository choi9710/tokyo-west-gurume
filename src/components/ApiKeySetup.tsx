import { useState } from 'react';

interface Props {
  onSave: (key: string) => void;
}

export function ApiKeySetup({ onSave }: Props) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const key = input.trim();
    if (!key) {
      setError('APIキーを入力してください。');
      return;
    }

    setIsVerifying(true);
    setError('');

    // 簡単な疎通確認（Place Details APIに空リクエスト → 400が返ればキー自体は有効）
    try {
      const res = await fetch(
        'https://places.googleapis.com/v1/places:searchText',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': key,
            'X-Goog-FieldMask': 'places.id',
          },
          body: JSON.stringify({ textQuery: 'test' }),
        }
      );

      if (res.status === 403) {
        setError('APIキーが無効です。キーを確認してください。');
        return;
      }

      // 200 or 400系（権限エラー以外）はキーとして有効とみなす
      localStorage.setItem('gmaps_api_key', key);
      onSave(key);
    } catch {
      setError('通信エラーが発生しました。インターネット接続を確認してください。');
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-3xl">🍜</span>
          <h1 className="text-xl font-bold text-gray-900">東京西グルメ</h1>
        </div>
        <p className="text-sm text-gray-500 mb-6">中野〜吉祥寺の飲食店検索アプリ</p>

        <h2 className="text-base font-semibold text-gray-800 mb-1">
          Google Maps APIキーを入力
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          このアプリはGoogle Maps APIを使用します。
          自分のAPIキーを入力してください。キーはこのブラウザにのみ保存されます。
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="off"
              spellCheck={false}
            />
            {error && (
              <p className="mt-1 text-xs text-red-600">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 rounded-lg text-sm transition-colors"
          >
            {isVerifying ? '確認中...' : '保存して始める'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-500 space-y-2">
          <p className="font-semibold text-gray-700">APIキーの取得方法</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              <a
                href="https://console.cloud.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Google Cloud Console
              </a>
              　にアクセス
            </li>
            <li>プロジェクトを作成</li>
            <li>「Places API (New)」と「Maps JavaScript API」を有効化</li>
            <li>「認証情報」→「APIキーを作成」</li>
            <li>作成されたキーをここに貼り付け</li>
          </ol>
          <p className="pt-1 text-gray-400">
            ※ 月$200の無料枠あり。個人利用では通常無料で使えます。
          </p>
        </div>
      </div>
    </div>
  );
}
