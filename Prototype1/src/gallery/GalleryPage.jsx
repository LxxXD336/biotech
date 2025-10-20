import React from "react";
import FourColumnInfiniteGallery from "./GalleryWidgets/FourColumnInfiniteGallery.jsx";
import MarqueeGallery from "./GalleryWidgets/MarqueeGallery.jsx";
import SelectedGroup from "./GalleryWidgets/SelectedGroup.jsx";
import { OverlayShell, StageFade, IntroGate } from "./GalleryWidgets/Transitions.jsx";
import SearchOverlay from "./GalleryWidgets/SearchOverlay.jsx";
import "./gallery.css";
import MainNav from "../components/MainNav";

const API_BASE = "http://localhost:5174";

export default function GalleryPage() {
    const [mode, setMode] = React.useState("grid");
    const [open, setOpen] = React.useState(false);
    const [closingStage, setClosingStage] = React.useState("idle");
    const [phase, setPhase] = React.useState("idle");
    const [selectedGroup, setSelectedGroup] = React.useState(null);
    const [closingChoose, setClosingChoose] = React.useState(false);
    const [closingSearch, setClosingSearch] = React.useState(false);
    const [searchExitTarget, setSearchExitTarget] = React.useState(null);
    const [nextAfterOverlayIn, setNextAfterOverlayIn] = React.useState("choose");
    const [searchCurtainOn, setSearchCurtainOn] = React.useState(false);
    const [marqueeCurtainOn, setMarqueeCurtainOn] = React.useState(false);
    const [items, setItems] = React.useState([]);

    const fetchItems = React.useCallback(async () => {
        try {
            const r = await fetch(`${API_BASE}/api/images`);
            const arr = await r.json();
            setItems(arr);
        } catch {
            setItems([]);
        }
    }, []);

    React.useEffect(() => {
        fetchItems();
        const bc = new BroadcastChannel("media-sync");
        bc.onmessage = () => fetchItems();
        const es = new EventSource(`${API_BASE}/api/events`);
        const onImages = () => fetchItems();
        es.addEventListener("images", onImages);
        es.addEventListener("ping", () => {});
        const onFocus = () => fetchItems();
        window.addEventListener("focus", onFocus);
        return () => {
            bc.close();
            es.close();
            window.removeEventListener("focus", onFocus);
        };
    }, [fetchItems]);

    const groups = React.useMemo(() => {
        const map = new Map();
        for (const it of items) {
            const key = it.category || "uncategorized";
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(it.url);
        }
        return Array.from(map.entries()).map(([id, urls]) => ({
            id,
            title: id,
            count: urls.length,
            cover: urls[0] || ""
        }));
    }, [items]);

    const imagesFrom = React.useCallback((groupId) => {
        return items.filter(it => (it.category || "uncategorized") === groupId).map(it => it.url);
    }, [items]);

    const allGridImages = React.useMemo(() => items.map(it => it.url), [items]);

    const effectiveGroup = selectedGroup || groups[0] || { id: "", title: "", count: 0, cover: "" };
    const marqueeImages = React.useMemo(
        () => (effectiveGroup.id ? imagesFrom(effectiveGroup.id) : []),
        [effectiveGroup, imagesFrom]
    );

    const defer = (fn) => setTimeout(fn, 0);

    const openMarquee = () => {
        if (phase === "search") {
            setMode("marquee");
            setSearchExitTarget("choose");
            setClosingStage("idle");
            setClosingSearch(true);
            return;
        }
        if (phase === "searchIntro") {
            setMode("marquee");
            setSearchExitTarget("choose");
            setClosingStage("idle");
            setPhase("search");
            defer(() => setClosingSearch(true));
            return;
        }
        if (!open) {
            setMode("marquee");
            setOpen(true);
            setClosingStage("idle");
            setSelectedGroup(null);
            setClosingChoose(false);
            setClosingSearch(false);
            setSearchExitTarget(null);
            setMarqueeCurtainOn(false);
            setNextAfterOverlayIn("choose");
            setPhase("overlayIn");
        } else {
            setMode("marquee");
            setClosingStage("idle");
            setClosingChoose(false);
            setClosingSearch(false);
            setSearchExitTarget(null);
            setMarqueeCurtainOn(false);
            setPhase("choose");
        }
    };

    const openSearch = () => {
        setSearchCurtainOn(true);
        setMarqueeCurtainOn(false);
        if (!open) {
            setMode("search");
            setOpen(true);
            setClosingStage("idle");
            setSelectedGroup(null);
            setClosingChoose(false);
            setClosingSearch(false);
            setSearchExitTarget(null);
            setNextAfterOverlayIn("searchIntro");
            setPhase("overlayIn");
        } else {
            setMode("search");
            setClosingStage("idle");
            setClosingChoose(false);
            setClosingSearch(false);
            setSearchExitTarget(null);
            setPhase("searchIntro");
        }
    };

    const closeOverlay = () => {
        if (!open) {
            setMode("grid");
            return;
        }
        if (phase === "choose") {
            setMode("grid");
            setMarqueeCurtainOn(false);
            setClosingChoose(true);
            return;
        }
        if (phase === "search") {
            setMode("grid");
            setSearchCurtainOn(false);
            setSearchExitTarget("grid");
            setClosingSearch(true);
            setClosingStage("slideOut");
            return;
        }
        setMode("grid");
        setMarqueeCurtainOn(false);
        setClosingStage("slideOut");
    };

    const searchItems = React.useMemo(() => {
        return items.map(x => ({
            id: String(x.id),
            src: x.url,
            name: x.name || (x.url.split("/").pop() || "image"),
            description: "",
            categories: [x.category || "uncategorized"],
            tags: Array.isArray(x.tags) ? x.tags : []
        }));
    }, [items]);

    return (
        <div className="gallery-page" style={{["--nav-bg"]:"#000",["--nav-border"]:"#000",["--nav-link"]:"#fff",["--nav-accent"]:"#fff"}}>
            <MainNav />
            <div className="grid-root">
                <FourColumnInfiniteGallery images={allGridImages} gap={16} />
            </div>

            <div id="modeSwitcher">
                <button className={"mode-btn" + (mode === "grid" ? " active" : "")} onClick={closeOverlay}>Grid</button>
                <button className={"mode-btn" + (mode === "marquee" ? " active" : "")} onClick={openMarquee}>Marquee</button>
                <button className={"mode-btn" + (mode === "search" ? " active" : "")} onClick={openSearch}>Search</button>
            </div>

            <div id="overlapLayer">
                <OverlayShell
                    open={open}
                    closingStage={closingStage}
                    onEntered={() => { if (phase === "overlayIn") setPhase(nextAfterOverlayIn); }}
                    onPanelOutDone={() => {
                        setOpen(false);
                        setClosingStage("idle");
                        setPhase("idle");
                        setSelectedGroup(null);
                        setClosingChoose(false);
                        setClosingSearch(false);
                        setSearchExitTarget(null);
                        setSearchCurtainOn(false);
                        setMarqueeCurtainOn(false);
                    }}
                >
                    <StageFade
                        show={phase === "choose" && !closingChoose}
                        exitY="120vh"
                        onExitComplete={() => {
                            if (closingChoose) {
                                setOpen(false);
                                setClosingStage("idle");
                                setPhase("idle");
                                setSelectedGroup(null);
                                setClosingChoose(false);
                                setNextAfterOverlayIn("choose");
                            }
                        }}
                    >
                        <SelectedGroup
                            key="choose"
                            groups={groups}
                            onPick={(group) => { setSelectedGroup(group); setMarqueeCurtainOn(true); setPhase("marqueeIntro"); }}
                            onRequestClose={closeOverlay}
                        />
                    </StageFade>

                    <IntroGate
                        key={"marquee-" + (marqueeCurtainOn ? "on" : "off")}
                        play={phase === "marqueeIntro"}
                        onDone={() => setPhase("marquee")}
                        persistBackdropAfter={marqueeCurtainOn}
                    />

                    <StageFade show={phase === "marquee"}>
                        <MarqueeGallery
                            key={`marquee-${effectiveGroup.id}-${marqueeImages.length}`}
                            images={marqueeImages}
                            title={effectiveGroup.title}
                            visible={phase === "marquee"}
                            closing={closingStage !== "idle"}
                            onSlideOutDone={() => setClosingStage("panelOut")}
                            onRequestClose={closeOverlay}
                        />
                    </StageFade>

                    <IntroGate
                        key={"search-" + (searchCurtainOn ? "on" : "off")}
                        play={phase === "searchIntro"}
                        onDone={() => setPhase("search")}
                        persistBackdropAfter={searchCurtainOn}
                    />

                    <StageFade
                        show={phase === "search" && !closingSearch}
                        exitY="120vh"
                        onExitComplete={() => {
                            if (!closingSearch) return;
                            if (searchExitTarget === "grid") {
                                setSearchCurtainOn(false);
                                setClosingSearch(false);
                                setSearchExitTarget(null);
                                setClosingStage("panelOut");
                                return;
                            }
                            if (searchExitTarget === "choose") {
                                setSearchCurtainOn(false);
                                setClosingSearch(false);
                                setSearchExitTarget(null);
                                setClosingStage("idle");
                                setPhase("choose");
                            }
                        }}
                    >
                        <SearchOverlay
                            groups={groups}
                            imagesFrom={imagesFrom}
                            onRequestClose={closeOverlay}
                            items={searchItems}
                        />
                    </StageFade>
                </OverlayShell>
            </div>
        </div>
    );
}
