import { useState, useEffect, useCallback } from "react";

const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_API;




export default function GifPicker({ onSelect }:{onSelect: ()=>void}) {
  const [query, setQuery] = useState("happy");
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const searchGifs = useCallback(async (searchQuery = query) => {
    setLoading(true);
    const res = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${searchQuery}&limit=12&rating=g`
    );
    const data = await res.json();
    console.log(data)
    setGifs(data.data);
    setLoading(false);
  },[query]);

  // Auto-fetch "happy" GIFs on mount
  useEffect(() => {
    searchGifs("happy");
  }, [searchGifs]);

  const handleSearch = (e) => {
    if (e.key === "Enter") searchGifs(query);
  };

  useEffect(()=>{
    console.log(gifs)
  },[gifs])

  return (
    <div style={{ border: "1px solid #ccc", padding: 12, width: 360, borderRadius: 8 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch}
          placeholder="Search GIFs..."
          style={{ flex: 1, padding: "6px 10px", borderRadius: 6, border: "1px solid #ddd" }}
        />
        <button onClick={() => searchGifs(query)} style={{ padding: "6px 14px", borderRadius: 6 }}>
          Search
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading GIFs...</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
          {gifs.map((gif) => (
            <img
              key={gif.id}
              src={gif.images.fixed_height_small.url}
              alt={gif.title}
              onClick={() => onSelect?.(gif.images.original.url)}
              style={{ width: "100%", cursor: "pointer", borderRadius: 4 }}
            />
          ))}
        </div>
      )}

      <p style={{ fontSize: 10, color: "#aaa", marginTop: 8, textAlign: "center" }}>
        Powered by GIPHY
      </p>
    </div>
  );
}