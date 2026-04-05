import { useState } from 'react';

interface Props {
  currentKey: string;
  onSave: (key: string) => void;
  onClose: () => void;
}

export function ApiKeyModal({ currentKey, onSave, onClose }: Props) {
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

    try {
      const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': key,
          'X-Goog-FieldMask': 'places.id',
        },
        body: JSON.stringify({ textQuery: 'test' }),
      });

      if (res.status === 403) {
        setError('APIキーが無効です。キーを確認してください。');
        return;
      }

      localStorage.setItem('gmaps_api_key', key);
      onSave(key);
    } catch {
      setError('通信エラーが発生しました。');
    } finally {
      setIsVerifying(false);
    }
  }

  const maskedKey = currentKey
    ? currentKey.slice(0, 8) + '••••••••••••••••' + currentKey.slice(-4)
    : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">APIキーを変更</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        {/* Current key */}
        {maskedKey && (
          <div className="mb-4 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-500 font-mono">
            現在: {maskedKey}
          </div>
        )}

        {/* Why section */}
        <div className="mb-4 p-3 bg-orange-50 border border-orange-100 rounded-lg text-xs text-orange-700">
          <p className="font-semibold mb-1">クォータ超過・キーエラーの場合</p>
          <p>自分のGoogle Maps APIキーを入力することで引き続き利用できます。月$200の無料枠あり。個人利用では通常無料です。</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-400"
              autoComplete="off"
              spellCheck={false}
              autoFocus
            />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium py-2 rounded-lg text-sm transition-colors"
          >
            {isVerifying ? '確認中...' : '保存して切り替える'}
          </button>
        </form>

        {/* How to get key */}
        <details className="mt-4">
          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none">
            APIキーの取得方法
          </summary>
          <ol className="mt-2 list-decimal list-inside space-y-1 text-xs text-gray-500">
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
            <li>「Places API (New)」と「Maps JavaScript API」と「Maps Static API」を有効化</li>
            <li>「認証情報」→「APIキーを作成」</li>
            <li>作成されたキーをここに貼り付け</li>
          </ol>
        </details>
      </div>
    </div>
  );
}
