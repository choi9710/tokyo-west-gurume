interface Props {
  onChangeApiKey?: () => void;
}

export function Header({ onChangeApiKey }: Props) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2">
        <span className="text-xl">🍜</span>
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">
          東京西グルメ
          <span className="ml-2 text-sm font-normal text-gray-500">西東京エリア 맛집 검색</span>
        </h1>
        {onChangeApiKey && (
          <button
            onClick={onChangeApiKey}
            className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline"
          >
            APIキー変更
          </button>
        )}
      </div>
    </header>
  );
}
