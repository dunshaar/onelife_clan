// script.js
(() => {
    const $ = (s, root = document) => root.querySelector(s);
    const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

    // Year
    const yearEl = $("#year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    // Mobile nav
    const navToggle = $("#navToggle");
    const navMenu = $("#navMenu");

    const openNav = () => {
        if (!navMenu || !navToggle) return;
        navMenu.classList.add("is-open");
        navToggle.setAttribute("aria-expanded", "true");
    };
    const closeNav = () => {
        if (!navMenu || !navToggle) return;
        navMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
    };

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", () => {
            const expanded = navToggle.getAttribute("aria-expanded") === "true";
            expanded ? closeNav() : openNav();
        });

        $$(".nav__link, .nav__cta", navMenu).forEach((a) => a.addEventListener("click", closeNav));

        document.addEventListener("click", (e) => {
            if (!navMenu.classList.contains("is-open")) return;
            const t = e.target;
            if (t === navToggle || navToggle.contains(t) || navMenu.contains(t)) return;
            closeNav();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeNav();
        });
    }

    // Toast
    const toast = $("#toast");
    let toastTimer = null;

    const showToast = (msg) => {
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add("is-open");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("is-open"), 4200);
    };

    // Form
    const form = $("#joinForm");
    const submitBtn = $("#submitBtn");

    const errFor = (name) => $(`[data-err="${name}"]`);
    const setErr = (name, msg) => {
        const el = errFor(name);
        if (el) el.textContent = msg || "";
    };

    const markField = (id, ok) => {
        const input = document.getElementById(id);
        if (!input) return;
        const field = input.closest(".field");
        if (!field) return;

        field.classList.remove("is-error", "is-ok");
        if (ok === true) field.classList.add("is-ok");
        if (ok === false) field.classList.add("is-error");
    };

    const clearMarks = () => {
        $$(".field.is-error, .field.is-ok").forEach((f) => f.classList.remove("is-error", "is-ok"));
        ["sid", "name", "kd", "hours", "contact", "consent"].forEach((k) => setErr(k, ""));
    };

    const scrollToFirstError = () => {
        const first = document.querySelector(".field.is-error");
        if (!first) return;
        first.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    let CFG = null;
    let hasTriedSubmit = false;

    const fallbackConfig = () => ({
        brand: { name: "0ne L1fe", game: "Standoff 2", tagline: "Standoff 2 Clan" },
        seasons: { current: "Season X", previous: "Season X-1" },
        form: {
            kd: { min: 0, max: 10, step: 0.01 },
            hours: { min: 0, max: 50000, step: 1 },
        },
        ranks: [
            "None / Not playing",
            "Bronze I",
            "Bronze II",
            "Bronze III",
            "Bronze IV",
            "Silver I",
            "Silver II",
            "Silver III",
            "Silver IV",
            "Gold I",
            "Gold II",
            "Gold III",
            "Gold IV",
            "Phoenix",
            "Ranger",
            "Champion",
            "Master",
            "Elite",
            "The Legend",
        ],
        submit: { endpoint: "", timeoutMs: 12000 },
        security: { formSecret: "CHANGE_ME_LONG_SECRET" },
    });

    const fetchConfig = async () => {
        try {
            const res = await fetch("info.json", { cache: "no-store" });
            if (!res.ok) throw new Error("config");
            return await res.json();
        } catch {
            return fallbackConfig();
        }
    };

    const fillText = (cfg) => {
        const brandName = $("#brandName");
        const brandGame = $("#brandGame");
        const heroTitle = $("#heroTitle");

        if (brandName) brandName.textContent = cfg?.brand?.name || "0ne L1fe";
        if (brandGame) brandGame.textContent = cfg?.brand?.tagline || `${cfg?.brand?.game || "Standoff 2"} Clan`;
        if (heroTitle) heroTitle.textContent = cfg?.brand?.name || "0ne L1fe";

        // seasons from info.json
        const cur = $("#seasonCurrent");
        const prev = $("#seasonPrevious");
        if (cur) cur.textContent = cfg?.seasons?.current || "Season X";
        if (prev) prev.textContent = cfg?.seasons?.previous || "Season X-1";

        const secret = $("#formSecret");
        if (secret) secret.value = cfg?.security?.formSecret || "";
    };

    const fillRanks = (cfg) => {
        const ranks = Array.isArray(cfg?.ranks) && cfg.ranks.length ? cfg.ranks : ["None / Not playing"];

        const selects = [
            $("#cur_duel"),
            $("#cur_allies"),
            $("#cur_comp"),
            $("#prev_duel"),
            $("#prev_allies"),
            $("#prev_comp"),
        ].filter(Boolean);

        const makeOpt = (txt) => {
            const o = document.createElement("option");
            o.value = txt;
            o.textContent = txt;
            return o;
        };

        selects.forEach((sel) => {
            sel.innerHTML = "";
            ranks.forEach((r) => sel.appendChild(makeOpt(r)));
            sel.value = ranks[0];
        });
    };

    const applyLimits = (cfg) => {
        const kd = $("#kd");
        const hours = $("#hours");

        if (kd && cfg?.form?.kd) {
            kd.min = String(cfg.form.kd.min ?? 0);
            kd.max = String(cfg.form.kd.max ?? 10);
            kd.step = String(cfg.form.kd.step ?? 0.01);
        }
        if (hours && cfg?.form?.hours) {
            hours.min = String(cfg.form.hours.min ?? 0);
            hours.max = String(cfg.form.hours.max ?? 50000);
            hours.step = String(cfg.form.hours.step ?? 1);
        }
    };

    // Only for enabling/disabling button (NO errors, NO highlights)
    const isFormComplete = () => {
        const sid = $("#sid")?.value?.trim() || "";
        const name = $("#name")?.value?.trim() || "";
        const kd = $("#kd")?.value?.trim() || "";
        const hours = $("#hours")?.value?.trim() || "";
        const contact = $("#contact")?.value?.trim() || "";
        const consent = $("#consent")?.checked === true;

        if (sid.length < 3) return false;
        if (name.length < 2) return false;

        const kdNum = Number(kd);
        if (!kd || Number.isNaN(kdNum)) return false;
        const kdMin = Number(CFG?.form?.kd?.min ?? 0);
        const kdMax = Number(CFG?.form?.kd?.max ?? 10);
        if (kdNum < kdMin || kdNum > kdMax) return false;

        const hNum = Number(hours);
        if (!hours || Number.isNaN(hNum)) return false;
        const hMin = Number(CFG?.form?.hours?.min ?? 0);
        const hMax = Number(CFG?.form?.hours?.max ?? 50000);
        if (hNum < hMin || hNum > hMax) return false;

        if (contact.length < 3) return false;
        if (!consent) return false;

        return true;
    };

    // Real validation (errors + highlights) — only when show=true
    const validate = (show = false) => {
        let ok = true;

        const sid = $("#sid")?.value?.trim() || "";
        const name = $("#name")?.value?.trim() || "";
        const kd = $("#kd")?.value?.trim() || "";
        const hours = $("#hours")?.value?.trim() || "";
        const contact = $("#contact")?.value?.trim() || "";
        const consent = $("#consent")?.checked === true;

        if (show) {
            ["sid", "name", "kd", "hours", "contact", "consent"].forEach((k) => setErr(k, ""));
        }

        // ID
        if (sid.length < 3) {
            ok = false;
            if (show) {
                setErr("sid", "Укажи корректный ID.");
                markField("sid", false);
            }
        } else if (show) {
            markField("sid", true);
        }

        // Name
        if (name.length < 2) {
            ok = false;
            if (show) {
                setErr("name", "Укажи ник.");
                markField("name", false);
            }
        } else if (show) {
            markField("name", true);
        }

        // KD
        const kdNum = Number(kd);
        if (!kd || Number.isNaN(kdNum)) {
            ok = false;
            if (show) {
                setErr("kd", "Укажи KD числом.");
                markField("kd", false);
            }
        } else {
            const min = Number(CFG?.form?.kd?.min ?? 0);
            const max = Number(CFG?.form?.kd?.max ?? 10);
            if (kdNum < min || kdNum > max) {
                ok = false;
                if (show) {
                    setErr("kd", `KD должен быть в диапазоне ${min}–${max}.`);
                    markField("kd", false);
                }
            } else if (show) {
                markField("kd", true);
            }
        }

        // Hours
        const hNum = Number(hours);
        if (!hours || Number.isNaN(hNum)) {
            ok = false;
            if (show) {
                setErr("hours", "Укажи часы числом.");
                markField("hours", false);
            }
        } else {
            const min = Number(CFG?.form?.hours?.min ?? 0);
            const max = Number(CFG?.form?.hours?.max ?? 50000);
            if (hNum < min || hNum > max) {
                ok = false;
                if (show) {
                    setErr("hours", `Часы должны быть в диапазоне ${min}–${max}.`);
                    markField("hours", false);
                }
            } else if (show) {
                markField("hours", true);
            }
        }

        // Contact
        if (contact.length < 3) {
            ok = false;
            if (show) {
                setErr("contact", "Укажи Telegram или Discord.");
                markField("contact", false);
            }
        } else if (show) {
            markField("contact", true);
        }

        // Consent
        if (!consent) {
            ok = false;
            if (show) {
                setErr("consent", "Нужно согласие на обработку данных.");
                markField("consent", false);
            }
        } else if (show) {
            markField("consent", true);
        }

        return ok;
    };

    const setSubmitState = () => {
        if (!submitBtn) return;
        submitBtn.disabled = !isFormComplete();

        // До первой попытки отправки не показываем ошибки/подсветку
        if (!hasTriedSubmit) return;

        // После первой попытки — подсветка обновляется “на лету”
        validate(true);
    };

    const buildPayload = () => ({
        sid: $("#sid")?.value?.trim() || "",
        name: $("#name")?.value?.trim() || "",
        kd: $("#kd")?.value?.trim() || "",
        hours: $("#hours")?.value?.trim() || "",
        contact: $("#contact")?.value?.trim() || "",
        note: $("#note")?.value?.trim() || "",
        seasons: {
            current: CFG?.seasons?.current || "Season X",
            previous: CFG?.seasons?.previous || "Season X-1",
        },
        ranks: {
            current: {
                duel: $("#cur_duel")?.value || "",
                allies: $("#cur_allies")?.value || "",
                competitive: $("#cur_comp")?.value || "",
            },
            previous: {
                duel: $("#prev_duel")?.value || "",
                allies: $("#prev_allies")?.value || "",
                competitive: $("#prev_comp")?.value || "",
            },
        },
        consent: true,
        security: {
            formSecret: $("#formSecret")?.value || "",
            honeypot: $("#company")?.value || "",
        },
    });

    const postWithTimeout = async (url, body, timeoutMs) => {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), timeoutMs);
        try {
            return await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify(body),
                signal: ctrl.signal,
            });
        } finally {
            clearTimeout(t);
        }
    };

    const init = async () => {
        CFG = await fetchConfig();
        fillText(CFG);
        fillRanks(CFG);
        applyLimits(CFG);

        if (!form) return;

        // On start: no highlights, button state only
        clearMarks();
        setSubmitState();

        ["input", "change"].forEach((evt) => {
            form.addEventListener(evt, () => setSubmitState());
        });

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const hp = $("#company")?.value?.trim();
            if (hp) {
                showToast("Ошибка.");
                return;
            }

            // First submit attempt turns on UX validation/highlighting
            hasTriedSubmit = true;

            if (!validate(true)) {
                setSubmitState();
                scrollToFirstError();
                showToast("Заполни обязательные поля.");
                return;
            }

            const endpoint = CFG?.submit?.endpoint || "";
            if (!endpoint) {
                showToast("Отправка сейчас недоступна.");
                return;
            }

            const prevText = submitBtn ? submitBtn.textContent : "";
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Отправка…";
            }

            try {
                const payload = buildPayload();
                const timeoutMs = Number(CFG?.submit?.timeoutMs ?? 12000);
                const res = await postWithTimeout(endpoint, payload, timeoutMs);

                if (res.ok) {
                    form.reset();
                    fillText(CFG);
                    fillRanks(CFG);
                    showToast("Заявка отправлена.");
                    // After successful submit: reset UX state
                    hasTriedSubmit = false;
                    clearMarks();
                } else {
                    showToast("Не удалось отправить. Попробуй позже.");
                }
            } catch {
                showToast("Ошибка сети. Попробуй позже.");
            } finally {
                if (submitBtn) submitBtn.textContent = prevText || "Отправить заявку";
                setSubmitState();
            }
        });
    };

    init();
})();
