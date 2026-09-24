pub fn text(key: &str, language: &str) -> &'static str {
    match (language, key) {
        ("tr", "open") => "Genel bakışı aç",
        ("tr", "refresh") => "Durumu yenile",
        ("tr", "pause") => "İzlemeyi duraklat / sürdür",
        ("tr", "settings") => "Ayarlar",
        ("tr", "codex") => "Codex'i aç",
        ("tr", "claude") => "Claude'u aç",
        ("tr", "gemini") => "Gemini'yi aç",
        ("tr", "antigravity") => "Antigravity'yi aç",
        ("tr", "quit") => "Çıkış",
        ("tr", "tooltip") => "Yerel yapay zekâ uygulamaları izleniyor",
        (_, "open") => "Open Dashboard",
        (_, "refresh") => "Refresh Status",
        (_, "pause") => "Pause / Resume Monitoring",
        (_, "settings") => "Settings",
        (_, "codex") => "Open Codex",
        (_, "claude") => "Open Claude",
        (_, "gemini") => "Open Gemini",
        (_, "antigravity") => "Open Antigravity",
        (_, "quit") => "Quit",
        _ => "Monitoring local AI applications",
    }
}

pub fn running_tooltip(count: usize, language: &str) -> String {
    if language == "tr" {
        format!("AI Usage Hub\n{count} uygulama çalışıyor")
    } else {
        format!("AI Usage Hub\n{count} app(s) running")
    }
}
