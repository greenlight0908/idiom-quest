/* 사자성어 여행단 - 서비스 워커 (network-first: 온라인이면 항상 최신) */
const CACHE = "idiom-quest-v7";   // 게임을 수정하면 v7, v8...으로 올려 주세요
const CORE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* network-first: 온라인이면 항상 서버 최신본, 실패(오프라인) 시에만 캐시 */
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  /* 랭킹 서버(Apps Script)는 절대 캐시하지 않음 - 항상 최신 데이터 */
  if (e.request.url.includes("script.google.com") || e.request.url.includes("googleusercontent.com")) return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && res.status === 200 && (res.type === "basic" || res.type === "cors")) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});
