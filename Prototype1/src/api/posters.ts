// src/api/posters.ts
export const API_BASE = import.meta.env.VITE_API_BASE;
const ADMIN_KEY = import.meta.env.VITE_ADMIN_PASSWORD;

export async function listPosters(opts?: { include_hidden?: boolean }) {
    const qs = opts?.include_hidden ? "?include_hidden=1" : "";
    const r = await fetch(`${API_BASE}/api/posters/${qs}`);
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);  // 不把 HTML 返回
    return r.json();
}

async function parseErr(r: Response) {
    const t = await r.text();
    throw new Error(`${r.status} ${r.statusText} ${t.slice(0,120)}`);
}

export async function hidePoster(id: number) {
    const r = await fetch(`${API_BASE}/api/posters/${id}/hide/`, {  // ✅ 有斜杠
        method: "POST",
        headers: { "X-Admin-Key": ADMIN_KEY },
    });
    if (!r.ok) await parseErr(r);
}

export async function unhidePoster(id: number) {
    const r = await fetch(`${API_BASE}/api/posters/${id}/unhide/`, { // ✅ 有斜杠
        method: "POST",
        headers: { "X-Admin-Key": ADMIN_KEY },
    });
    if (!r.ok) await parseErr(r);
}

export async function deletePoster(id: number) {
    const r = await fetch(`${API_BASE}/api/posters/${id}/`, {        // ✅ 有斜杠
        method: "DELETE",
        headers: { "X-Admin-Key": ADMIN_KEY },
    });
    if (!r.ok) await parseErr(r);
}

export async function createPoster(data: { /* ...同之前... */ }) {
    const fd = new FormData();
    fd.set("title", data.title);
    fd.set("year", String(data.year));
    if (data.award) fd.set("award", data.award);
    if (data.type) fd.set("type", data.type);
    if (data.area) fd.set("area", data.area);
    if (data.description) fd.set("description", data.description);
    fd.set("image", data.image);               // 👈 必填
    if (data.pdf) fd.set("pdf", data.pdf);

    const r = await fetch(`${API_BASE}/api/posters/`, {
        method: "POST",
        headers: { "X-Admin-Key": ADMIN_KEY },   // 👈 别设 Content-Type！
        body: fd,
    });
    if (!r.ok) throw new Error(await parseErr(r));
    return r.json();
}

function toFormData(data: Record<string, any>) {
    const fd = new FormData();
    for (const [k, v] of Object.entries(data)) {
        if (v === undefined || v === null) continue;
        // 数字要转字符串；文件原样塞进去
        if (v instanceof Blob) fd.append(k, v);
        else fd.append(k, String(v));
    }
    return fd;
}

export async function updatePoster(id: number, data: Record<string, any>) {
    // 只传后端接受的字段名：title/year/award/type/area/description/image/pdf/hidden
    const fd = toFormData(data);
    const r = await fetch(`${API_BASE}/api/posters/${id}/`, {
        method: "PATCH",
        headers: {
            "X-Admin-Key": ADMIN_KEY,          // ✅ 只带鉴权头；不要自己设 Content-Type
        },
        body: fd,                             // ✅ 让浏览器自动加 boundary
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
}

export async function removePoster(id: number) {
    const r = await fetch(`${API_BASE}/api/posters/${id}/`, {
        method: 'DELETE',
        headers: { 'X-Admin-Key': ADMIN_KEY },
    });
    if (!r.ok) throw new Error('delete failed');
    return true;
}
