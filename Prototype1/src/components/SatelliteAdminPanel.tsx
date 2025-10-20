import React from "react";

interface SatelliteAdminPanelProps {
    satelliteType: "queensland" | "victoria";
}

// Environment detection utility
const getEnvVar = (key: string, defaultValue: string = ""): string => {
    // Check if we're in a test environment
    const isTestEnv = typeof process !== "undefined" && 
                     process.env && 
                     (process.env.NODE_ENV === "test" || process.env.JEST_WORKER_ID);
    
    if (isTestEnv) {
        return process.env[key] || defaultValue;
    }
    
    // Browser environment - use import.meta.env
    if (typeof window !== "undefined") {
        try {
            // Use eval to avoid Jest parsing issues with import.meta
            const importMeta = eval('import.meta');
            return importMeta?.env?.[key] || defaultValue;
        } catch (error) {
            return defaultValue;
        }
    }
    
    // Fallback to process.env
    return process.env[key] || defaultValue;
};

export default function SatelliteAdminPanel({ satelliteType }: SatelliteAdminPanelProps) {
    const ls = typeof window !== "undefined" ? window.localStorage : undefined;
    const ss = typeof window !== "undefined" ? window.sessionStorage : undefined;

    const [admin, setAdmin] = React.useState<boolean>(() => ss?.getItem("btf.admin") === "true");
    const [showPanel, setShowPanel] = React.useState(false);
    const [showLogin, setShowLogin] = React.useState(false);
    const [pwd, setPwd] = React.useState("");
    const [, forceRerender] = React.useState(0);

    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "a") {
                if (admin) {
                    setShowPanel(true);
                } else {
                    setShowLogin(true);
                }
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [admin]);

    const doLogin = React.useCallback(() => {
        const expected = getEnvVar("VITE_ADMIN_PASSWORD", "biotech");
        if (pwd === expected) {
            setAdmin(true);
            setShowPanel(true);
            try { ss?.setItem("btf.admin", "true"); } catch {}
            // Restore inline edit state if it was previously enabled
            const wasInlineEditEnabled = ss?.getItem("btf.inlineEdit") === "true";
            if (wasInlineEditEnabled) {
                setInlineEdit(true);
            }
            // Dispatch custom event to notify Editable components
            window.dispatchEvent(new CustomEvent('satelliteAdminUpdate'));
            window.dispatchEvent(new CustomEvent('satelliteInlineEditUpdate'));
            setShowLogin(false);
            setPwd("");
        } else {
            alert("Incorrect password");
        }
    }, [pwd, ss]);

    const doLogout = React.useCallback(() => {
        setAdmin(false);
        setShowPanel(false);
        try { ss?.removeItem("btf.admin"); } catch {}
        // Don't remove btf.inlineEdit to preserve user preference
        // Dispatch custom event to notify Editable components
        window.dispatchEvent(new CustomEvent('satelliteAdminUpdate'));
        window.dispatchEvent(new CustomEvent('satelliteInlineEditUpdate'));
    }, [ss]);

    // helpers
    const toDataUrl = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => resolve(String(fr.result || ""));
            fr.onerror = reject;
            fr.readAsDataURL(file);
        });

    const getJson = (k: string) => { try { return JSON.parse(ls?.getItem(k) || "{}"); } catch { return {}; } };
    const setJson = (k: string, v: any) => { try { ls?.setItem(k, JSON.stringify(v)); } catch {} };

    // image overrides
    type ImgKey = "bgHero" | "bgIntro" | "bgAbout" | "logo1" | "logo2";
    const IMG_KEY = `btfImageOverrides.${satelliteType}`;
    const setImgOverride = async (key: ImgKey, files: FileList | null) => {
        const f = files?.[0]; if (!f) return;
        const data = await toDataUrl(f);
        const next = { ...getJson(IMG_KEY), [key]: data };
        setJson(IMG_KEY, next);
        forceRerender(Math.random());
        // Dispatch custom event to notify satellite components
        window.dispatchEvent(new CustomEvent('satelliteImageUpdate', { detail: { satelliteType, IMG_KEY } }));
    };
    const resetImgOverride = (key: ImgKey) => {
        const next = { ...getJson(IMG_KEY) };
        delete next[key];
        setJson(IMG_KEY, next);
        forceRerender(Math.random());
        // Dispatch custom event to notify satellite components
        window.dispatchEvent(new CustomEvent('satelliteImageUpdate', { detail: { satelliteType, IMG_KEY } }));
    };

    // text overrides
    const TEXT_KEY = `btf.satellite.${satelliteType}.text`;
    const readText = () => { try { return JSON.parse(ls?.getItem(TEXT_KEY) || "{}") || {}; } catch { return {}; } };
    const writeText = (m: Record<string, string>) => { try { ls?.setItem(TEXT_KEY, JSON.stringify(m)); } catch {} };

    const textGet = (id: string, fallback: string) => (readText()[id] ?? fallback);
    const textSet = (id: string, v: string) => { 
        const m = readText(); 
        m[id] = v; 
        writeText(m); 
        forceRerender(Math.random());
        // Dispatch custom event to notify Editable components
        window.dispatchEvent(new CustomEvent('satelliteTextUpdate', { detail: { satelliteType, TEXT_KEY } }));
    };
    const textReset = (id: string) => { 
        const m = readText(); 
        delete m[id]; 
        writeText(m); 
        forceRerender(Math.random());
        // Dispatch custom event to notify Editable components
        window.dispatchEvent(new CustomEvent('satelliteTextUpdate', { detail: { satelliteType, TEXT_KEY } }));
    };
    const textResetAll = () => { 
        try { ls?.removeItem(TEXT_KEY); } catch {}; 
        forceRerender(Math.random());
        // Dispatch custom event to notify Editable components
        window.dispatchEvent(new CustomEvent('satelliteTextUpdate', { detail: { satelliteType, TEXT_KEY } }));
    };

    // Export image override functions for use in satellite components
    const getImageOverride = (key: ImgKey, fallback: string) => {
        const ov = getJson(IMG_KEY);
        return ov[key] || fallback;
    };

    const [inlineEdit, setInlineEdit] = React.useState<boolean>(() => ss?.getItem("btf.inlineEdit") === "true");
    const toggleInline = () => {
        setInlineEdit(v => {
            const nv = !v;
            try { ss?.setItem("btf.inlineEdit", String(nv)); } catch {}
            // Dispatch custom event to notify Editable components
            window.dispatchEvent(new CustomEvent('satelliteInlineEditUpdate'));
            return nv;
        });
    };

    // inline editable component
    function Editable({
        id, defaultText, as = "span", className, style
    }: { id: string; defaultText: string; as?: keyof React.JSX.IntrinsicElements; className?: string; style?: React.CSSProperties }) {
        const Tag = as as any;
        const canEdit = admin && inlineEdit;
        const val = textGet(id, defaultText);
        return (
            <Tag
                contentEditable={canEdit}
                suppressContentEditableWarning
                data-editable-id={id}
                className={className}
                style={style}
                onBlur={(e: React.FocusEvent<HTMLElement>) => {
                    const t = (e.currentTarget.innerText || "").replace(/\s+/g, " ").trim();
                    textSet(id, t);
                }}
            >
                {val}
            </Tag>
        );
    }

    // Define text fields based on satellite type
    const getTextFields = () => {
        const baseFields = [
            { id: "hero.tagline", label: "Hero tagline", def: satelliteType === "queensland" ? "The BIOTech Futures Challenge will take place in QLD" : "THE BIOTECH FUTURES CHALLENGE WILL TAKE PLACE IN VIC" },
            { id: "hero.title", label: "Hero title", def: satelliteType === "queensland" ? "QUEENSLAND CHAPTER" : "VICTORIA CHAPTER" },
            { id: "hero.subtitle", label: "Hero subtitle", def: satelliteType === "queensland" ? "The BIOTech Futures Challenge is about to begin in Queensland. Register now before competition entries close July 12." : "The Challenge in Victoria has now started. Good luck to our participating teams and mentors!" },
            { id: "intro.pill", label: "Intro pill", def: "INTRODUCTION" },
            { id: "intro.title", label: "Intro title", def: satelliteType === "queensland" ? "Are You A Student From Queensland?" : "Are You A Student From Victoria?" },
            { id: "intro.subtitle", label: "Intro subtitle", def: "Come and Join us" },
            { id: "intro.text1", label: "Intro text 1", def: satelliteType === "queensland" ? "After the success of our Queensland Satellite Chapter in 2023, we are continuing to expand and want to give more students the opportunity to work on a project with a world-class researcher. The BIOTech Futures Challenge in QLD will follow the same structure as NSW and International challenges — so check out what's in store here." : "After the success of our Melbourne Satellite Chapter in 2022, we are continuing to expand and want to give more students the opportunity to work on a project with a world-class researcher. The BIOTech Futures Challenge in MELB will follow the same structure as NSW and International challenges so check out what's in store here." },
            { id: "intro.text2", label: "Intro text 2", def: satelliteType === "queensland" ? "Please note the QLD challenge will take place before the NSW challenge, so register your interest early. Finalists and runners-up from each Satellite Challenge will have the opportunity to fly to Sydney to present at the Sydney Symposium." : "Please note the MELB Challenge will take place before the NSW challenge so register your interest so you don't miss out. Finalists and runners-up from each Satellite Challenge will have the opportunity to fly out to Sydney to present at the Sydney Symposium." },
            { id: "about.pill", label: "About pill", def: satelliteType === "queensland" ? "QLD CHALLENGE" : "VIC CHALLENGE" },
            { id: "about.title", label: "About title", def: satelliteType === "queensland" ? "ABOUT THE QLD CHALLENGE" : "ABOUT THE VIC CHALLENGE" },
            { id: "about.card1.title", label: "About Card 1 Title", def: satelliteType === "queensland" ? "QLD Challenge Overview" : "VIC Challenge Overview" },
            { id: "about.card1.content", label: "About Card 1 Content", def: satelliteType === "queensland" ? "The Queensland BIOTech Futures Challenge is hosted by the ARC Training Centre for Joint Biomechanics at QUT in Brisbane, Australia in conjunction with QUT's STEM High School Engagement program." : "The Victorian BIOTech Futures Challenge is hosted by the Melbourne Bioinnovation Student Initiative (MBSI) at the University of Melbourne, Melbourne, Australia in collaboration with the Graeme Clarke Institute for Biomedical Engineering." },
            { id: "about.card1.extra", label: "About Card 1 Extra", def: satelliteType === "queensland" ? "Even though our Centre is focused on medical technologies, the QLD BIOTech Futures Challenge will include a wide range of project topics and mentors from varying STEM fields." : "Registration for the VIC challenge will open from June 5th. However, due to limited places spots are filling up fast. If you or your group are keen on participating don't forget to sign-up." },
            { id: "about.card2.title", label: "About Card 2 Title", def: "Our Mission" },
            { id: "about.card2.content", label: "About Card 2 Content", def: satelliteType === "queensland" ? "The ARC Training Centre for Joint Biomechanics brings together leading researchers, surgeons and medical device companies to train the next generation workforce in biomedical technologies and to actively transform the orthopaedic industry through innovative new solutions." : "MBSI is lead by a group of undergraduate, postgraduate and medical students with backgrounds across science, engineering and medicine. We share an interest in technology and its applications in medicine and the biological sciences." },
            { id: "about.card2.extra", label: "About Card 2 Extra", def: satelliteType === "queensland" ? "We tackle clinical- and industry-focused challenges in biomechanics with the goal to drive surgical practice towards personalised treatment and better patient outcomes. Our team is developing tools for surgical planning, robotic simulation, medical device assessment, and personalised post-surgical assessment." : "We founded MBSI to nurture the next generation of medtech and biotech innovators. We are a registered charity and nonprofit organisation entirely operated by volunteers, many of whom are current students at the University of Melbourne. Beginning with only a small team of like-minded classmates in late 2020, we now count over 50 volunteers and 200 members across the organisation. Our aim is to help students and other young people explore this space by providing opportunities for multidisciplinary collaboration and learning." },
            { id: "about.card3.title", label: "About Card 3 Title", def: satelliteType === "queensland" ? "Our Expertise" : "Our Membership" },
            { id: "about.card3.content", label: "About Card 3 Content", def: satelliteType === "queensland" ? "The expertise of our team is spread over three leading Australian universities, and numerous international university and industry partners." : "Membership in MBSI is free and open to all; there exists no requirement for a prospective member to be a student, nor affiliated with the University of Melbourne." },
            { id: "about.card3.extra", label: "About Card 3 Extra", def: satelliteType === "queensland" ? "We are developing technologies such as software tools for pre-surgical planning and decision making, computer simulation systems, robotic systems for surgical training and simulation, medical device assessment and surgical assistants, and personalised post-surgical assessment tools. Our team have experience in fields ranging from cell and tissue culture to robotic vision to wearable sensors." : "In fact, we encourage anyone with an interest in medical technology to join as a member. To find out more about our initiative and become a member click the link below. " },
            { id: "timeline.pill", label: "Timeline pill", def: "KEY DATES" },
            { id: "timeline.title", label: "Timeline title", def: satelliteType === "queensland" ? "KEY QLD DATES 2025" : "KEY VIC DATES 2022" },
            { id: "contact.title", label: "Contact title", def: "CONTACT" },
            { id: "contact.subtitle", label: "Contact subtitle", def: "We'd love to hear from you" },
            { id: "contact.text", label: "Contact text", def: satelliteType === "queensland" ? "We're happy to answer all your questions about the Queensland BIOTech Futures Challenge. Before you get in contact make sure to check out our FAQ's." : "We're happy to answer all your questions about the Victoria BIOTech Futures Challenge. Before you get in contact make sure to check out our FAQ's." },
            { id: "contact.email", label: "Contact email", def: satelliteType === "queensland" ? "✉️ contact@jointbiomechanics.org" : "✉️ anke.oatley@mbsi.org.au" },
        ];

        if (satelliteType === "queensland") {
            baseFields.push(
                { id: "mentor.pill", label: "Mentor pill", def: "MENTORS" },
                { id: "mentor.title", label: "Mentor title", def: "MEET OUR 2025 MENTORS" },
                { id: "mentor.subtitle", label: "Mentor subtitle", def: "Click on each mentor to find out more" },
                { id: "video.pill", label: "Video pill", def: "VIDEO" },
                { id: "video.title", label: "Video title", def: "BIOTECH FUTURES CHALLENGE" },
                { id: "video.subtitle", label: "Video subtitle", def: "Watch our video to find out more" },
            );
        } else {
            baseFields.push(
                { id: "projectlist.pill", label: "Project List pill", def: "Project List" },
                { id: "projectlist.title", label: "Project List title", def: "2025 PROJECT LIST" },
                { id: "projectlist.subtitle", label: "Project List subtitle", def: "Click on each project to find out more" },
            );
        }

        return baseFields;
    };

    const TEXT_FIELDS = getTextFields();

    return (
        <>
            {/* Hidden trigger dot */}
            <button
                onClick={() => {
                    if (admin) {
                        setShowPanel(true);
                    } else {
                        setShowLogin(true);
                    }
                }}
                aria-label="Open satellite admin"
                title="Satellite Admin"
                style={{
                    position: "fixed",
                    right: 10,
                    bottom: 42,
                    width: 22,
                    height: 22,
                    borderRadius: 9999,
                    border: 0,
                    background: "#017151",
                    opacity: 0.12,
                    cursor: "pointer",
                    zIndex: 1000,
                }}
            />

            {/* Login modal */}
            {showLogin && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "grid", placeItems: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 12, padding: 16, width: 360, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
                        <h3 style={{ marginBottom: 10, color: "#017151" }}>Satellite Admin Login</h3>
                        <input
                            type="password"
                            value={pwd}
                            onChange={(e) => setPwd(e.target.value)}
                            placeholder="Enter password"
                            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd", background: "#fff", color: "#333" }}
                        />
                        <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            <button onClick={() => { setShowLogin(false); setPwd(""); }} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>Cancel</button>
                            <button onClick={doLogin} style={{ padding: "8px 12px", borderRadius: 8, border: 0, background: "#017151", color: "#fff", cursor: "pointer" }}>Login</button>
                        </div>
                        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>Hint: Press Ctrl/⌘ + Shift + A</div>
                    </div>
                </div>
            )}

            {/* Admin panel */}
            {admin && showPanel && (
                <div style={{ position: "fixed", bottom: 16, right: 16, zIndex: 1000, background: "#ffffff", border: "1px solid #E6F3EE", borderRadius: 12, padding: 12, boxShadow: "0 10px 24px rgba(0,0,0,0.12)", width: 380 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ fontWeight: 700, color: "#017151" }}>
                            {satelliteType === "queensland" ? "Queensland" : "Victoria"} Satellite Admin
                        </div>
                        <button
                            onClick={() => setShowPanel(false)}
                            style={{
                                background: "none",
                                border: "none",
                                fontSize: "18px",
                                cursor: "pointer",
                                color: "#666",
                                padding: "4px",
                                borderRadius: "4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "24px",
                                height: "24px"
                            }}
                            title="Close admin panel"
                        >
                            ×
                        </button>
                    </div>

                    {/* Inline editing toggle */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <input id="sat-inline" type="checkbox" checked={inlineEdit} onChange={toggleInline} />
                        <label htmlFor="sat-inline" style={{ userSelect: "none" }}>Enable inline text editing on page</label>
                    </div>

                    {/* Image overrides */}
                    <div style={{ fontWeight: 700, color: "#017151", marginBottom: 6 }}>Images & Logos</div>
                    {[
                        { key: "bgHero", label: "Hero image" },
                        { key: "bgIntro", label: "Intro section image" },
                        { key: "bgAbout", label: "About section image" },
                        { key: "logo1", label: satelliteType === "queensland" ? "Contact Logo1" : "Contact Logo1" },
                        { key: "logo2", label: satelliteType === "queensland" ? "Contact Logo2" : "Contact Logo2" },
                    ].map(({ key, label }) => (
                        <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <span style={{ minWidth: 170 }}>{label}</span>
                            <input
                                id={`sat-${key}`}
                                type="file"
                                accept="image/*"
                                lang="en"
                                style={{ display: "none" }}
                                onChange={(e) => setImgOverride(key as ImgKey, e.currentTarget.files)}
                            />
                            <button onClick={() => document.getElementById(`sat-${key}`)?.click()} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>
                                Choose file
                            </button>
                            <button onClick={() => resetImgOverride(key as ImgKey)} style={{ padding: "6px 10px", borderRadius: 6, border: 0, background: "#f6f6f6", cursor: "pointer" }}>
                                Reset
                            </button>
                        </div>
                    ))}

                    <div style={{ height: 1, background: "#E6F3EE", margin: "8px 0" }} />

                    {/* Text overrides */}
                    <div style={{ fontWeight: 700, color: "#017151", marginBottom: 6 }}>Text overrides</div>
                    <div style={{ display: "grid", gap: 8, maxHeight: 220, overflow: "auto", paddingRight: 4 }}>
                        {TEXT_FIELDS.map(f => {
                            const val = textGet(f.id, f.def);
                            return (
                                <div key={f.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 6, alignItems: "center" }}>
                                    <div>
                                        <div style={{ fontSize: 12, opacity: .75, marginBottom: 4 }}>{f.label}</div>
                                        <input
                                            value={val}
                                            onChange={(e) => textSet(f.id, e.target.value)}
                                            style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", color: "#333" }}
                                        />
                                    </div>
                                    <button onClick={() => textReset(f.id)} style={{ height: 32, padding: "6px 10px", borderRadius: 6, border: 0, background: "#f6f6f6", cursor: "pointer" }}>
                                        Reset
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginTop: 10 }}>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button
                                onClick={() => {
                                    // reset everything
                                    try { ls?.removeItem(`btf.satellite.${satelliteType}.text`); } catch {}
                                    try { ls?.removeItem(`btfImageOverrides.${satelliteType}`); } catch {}
                                    try { ls?.removeItem(`btf.satellite.${satelliteType}.kit`); } catch {}
                                    try { ls?.removeItem(`btf.satellite.${satelliteType}.poster`); } catch {}
                                    textResetAll();
                                    // Dispatch custom events to notify components
                                    window.dispatchEvent(new CustomEvent('satelliteTextUpdate', { detail: { satelliteType, TEXT_KEY } }));
                                    window.dispatchEvent(new CustomEvent('satelliteImageUpdate', { detail: { satelliteType, IMG_KEY } }));
                                    forceRerender(Math.random());
                                }}
                                style={{ fontSize: 12, border: 0, background: "#1a73e8", color: "#fff", borderRadius: 6, padding: "6px 8px", cursor: "pointer" }}
                            >
                                Reset All
                            </button>
                            <button
                                onClick={doLogout}
                                style={{ fontSize: 12, border: 0, background: "#dc3545", color: "#fff", borderRadius: 6, padding: "6px 8px", cursor: "pointer" }}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Export Editable component for use in satellite pages */}
            <style>{`
                ${inlineEdit ? `
                    [contenteditable="true"]{
                        outline: 1px dashed #017151;
                        outline-offset: 2px;
                        cursor: text;
                    }
                    [contenteditable="true"]:focus{
                        background: rgba(1,113,81,0.06);
                    }
                ` : ``}
            `}</style>
        </>
    );
}

// Export the Editable component for use in satellite pages
export function Editable({
    id, defaultText, as = "span", className, style, satelliteType
}: { 
    id: string; 
    defaultText: string; 
    as?: keyof React.JSX.IntrinsicElements; 
    className?: string; 
    style?: React.CSSProperties;
    satelliteType?: "queensland" | "victoria";
}) {
    const ls = typeof window !== "undefined" ? window.localStorage : undefined;
    const ss = typeof window !== "undefined" ? window.sessionStorage : undefined;
    
    const [admin, setAdmin] = React.useState<boolean>(() => ss?.getItem("btf.admin") === "true");
    const [inlineEdit, setInlineEdit] = React.useState<boolean>(() => ss?.getItem("btf.inlineEdit") === "true");
    const [updateTrigger, setUpdateTrigger] = React.useState(0);
    
    const TEXT_KEY = satelliteType ? `btf.satellite.${satelliteType}.text` : "btf.satellite.text";
    const readText = () => { try { return JSON.parse(ls?.getItem(TEXT_KEY) || "{}") || {}; } catch { return {}; } };
    const writeText = (m: Record<string, string>) => { try { ls?.setItem(TEXT_KEY, JSON.stringify(m)); } catch {} };
    
    const textGet = (id: string, fallback: string) => (readText()[id] ?? fallback);
    const textSet = (id: string, v: string) => { 
        const m = readText(); 
        m[id] = v; 
        writeText(m); 
        setUpdateTrigger(Math.random()); 
    };
    
    // Listen for custom events to update when Reset/Reset All is used
    React.useEffect(() => {
        const handleTextUpdate = (e: CustomEvent) => {
            if (e.detail?.satelliteType === satelliteType && e.detail?.TEXT_KEY === TEXT_KEY) {
                setUpdateTrigger(Math.random());
            }
        };
        
        const handleAdminUpdate = () => {
            setAdmin(ss?.getItem("btf.admin") === "true");
        };
        
        const handleInlineEditUpdate = () => {
            setInlineEdit(ss?.getItem("btf.inlineEdit") === "true");
        };
        
        window.addEventListener('satelliteTextUpdate', handleTextUpdate as EventListener);
        window.addEventListener('satelliteAdminUpdate', handleAdminUpdate as EventListener);
        window.addEventListener('satelliteInlineEditUpdate', handleInlineEditUpdate as EventListener);
        
        return () => {
            window.removeEventListener('satelliteTextUpdate', handleTextUpdate as EventListener);
            window.removeEventListener('satelliteAdminUpdate', handleAdminUpdate as EventListener);
            window.removeEventListener('satelliteInlineEditUpdate', handleInlineEditUpdate as EventListener);
        };
    }, [satelliteType, TEXT_KEY, ss]);
    
    const Tag = as as any;
    const canEdit = admin && inlineEdit;
    const val = textGet(id, defaultText);
    
    return (
        <Tag
            contentEditable={canEdit}
            suppressContentEditableWarning
            data-editable-id={id}
            className={className}
            style={style}
            onBlur={(e: React.FocusEvent<HTMLElement>) => {
                const t = (e.currentTarget.innerText || "").replace(/\s+/g, " ").trim();
                textSet(id, t);
            }}
        >
            {val}
        </Tag>
    );
}

// Export image override hook for use in satellite components
export function useImageOverride(satelliteType: "queensland" | "victoria") {
    const ls = typeof window !== "undefined" ? window.localStorage : undefined;
    const [, forceRerender] = React.useState(0);
    
    const IMG_KEY = `btfImageOverrides.${satelliteType}`;
    const getJson = (k: string) => { try { return JSON.parse(ls?.getItem(k) || "{}"); } catch { return {}; } };
    
    const getImageOverride = React.useCallback((key: string, fallback: string) => {
        const ov = getJson(IMG_KEY);
        return ov[key] || fallback;
    }, [IMG_KEY]);
    
    // Listen for image updates
    React.useEffect(() => {
        const handleImageUpdate = (e: CustomEvent) => {
            if (e.detail?.satelliteType === satelliteType && e.detail?.IMG_KEY === IMG_KEY) {
                forceRerender(Math.random());
            }
        };
        
        window.addEventListener('satelliteImageUpdate', handleImageUpdate as EventListener);
        return () => window.removeEventListener('satelliteImageUpdate', handleImageUpdate as EventListener);
    }, [satelliteType, IMG_KEY]);
    
    return getImageOverride;
}
