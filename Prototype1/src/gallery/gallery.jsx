import React from "react";
import { createRoot } from "react-dom/client";
import FourColumnInfiniteGallery from "./GalleryWidgets/FourColumnInfiniteGallery.jsx";
import MarqueeGallery from "./GalleryWidgets/MarqueeGallery.jsx";
import SelectedGroup from "./GalleryWidgets/SelectedGroup.jsx";
import { OverlayShell, StageFade, IntroGate } from "./GalleryWidgets/Transitions.jsx";
import SearchOverlay from "./GalleryWidgets/SearchOverlay.jsx";

const GROUPS = [
    { id: "symposium", title: "Symposium", count: 30 },
    { id: "symposium2022", title: "Symposium 2022", count: 12 },
    { id: "symposium2023", title: "Symposium 2023", count: 18 },
];

function generateImages(folder, count) {
    return Array.from({ length: count }, (_, i) => `/resources/${folder}/${i + 1}.jpg`);
}
function imagesFrom(groupId) {
    const g = GROUPS.find((x) => x.id === groupId);
    if (!g) return [];
    return generateImages(g.id, g.count);
}
function coverFor(groupId) {
    const imgs = imagesFrom(groupId);
    return imgs[0] || `/resources/${groupId}/cover.jpg`;
}

const defaultGridImages = imagesFrom(GROUPS[0].id);
const rootEl = document.getElementById("root");
if (rootEl) {
    createRoot(rootEl).render(<FourColumnInfiniteGallery images={defaultGridImages} gap={16} />);
}

function OverlayHost() {
    const [open, setOpen] = React.useState(false);
    const [closingStage, setClosingStage] = React.useState("idle");
    const [phase, setPhase] = React.useState("idle");
    const [selectedGroup, setSelectedGroup] = React.useState(null);
    const [closingChoose, setClosingChoose] = React.useState(false);
    const [closingSearch, setClosingSearch] = React.useState(false);
    const [searchExitTarget, setSearchExitTarget] = React.useState(null);
    const [nextAfterOverlayIn, setNextAfterOverlayIn] = React.useState("choose");

    React.useEffect(() => {
        const onOpenMarquee = () => {
            if (!open) {
                setOpen(true);
                setClosingStage("idle");
                setSelectedGroup(null);
                setClosingChoose(false);
                setClosingSearch(false);
                setSearchExitTarget(null);
                setNextAfterOverlayIn("choose");
                setPhase("overlayIn");
                return;
            }
            if (phase === "search") {
                setSearchExitTarget("choose");
                setClosingSearch(true);
                return;
            }
            setClosingStage("idle");
            setClosingChoose(false);
            setClosingSearch(false);
            setSearchExitTarget(null);
            setPhase("choose");
        };

        const onOpenSearch = () => {
            if (!open) {
                setOpen(true);
                setClosingStage("idle");
                setSelectedGroup(null);
                setClosingChoose(false);
                setClosingSearch(false);
                setSearchExitTarget(null);
                setNextAfterOverlayIn("searchIntro");
                setPhase("overlayIn");
                return;
            }
            setClosingStage("idle");
            setClosingChoose(false);
            setClosingSearch(false);
            setSearchExitTarget(null);
            setPhase("searchIntro");
        };

        const onClose = () => {
            if (!open) return;
            if (phase === "choose") {
                setClosingChoose(true);
                return;
            }
            if (phase === "search") {
                setSearchExitTarget("grid");
                setClosingSearch(true);
                setClosingStage("slideOut");
                return;
            }
            setClosingStage("slideOut");
        };

        window.addEventListener("open-overlay", onOpenMarquee);
        window.addEventListener("open-search-overlay", onOpenSearch);
        window.addEventListener("close-overlay", onClose);
        return () => {
            window.removeEventListener("open-overlay", onOpenMarquee);
            window.removeEventListener("open-search-overlay", onOpenSearch);
            window.removeEventListener("close-overlay", onClose);
        };
    }, [open, phase]);

    const effectiveGroup = selectedGroup || GROUPS[0];
    const marqueeImages = imagesFrom(effectiveGroup.id);

    return (
        <OverlayShell
            open={open}
            closingStage={closingStage}
            onEntered={() => {
                if (phase === "overlayIn") setPhase(nextAfterOverlayIn);
            }}
            onPanelOutDone={() => {
                setOpen(false);
                setClosingStage("idle");
                setPhase("idle");
                setSelectedGroup(null);
                setClosingChoose(false);
                setClosingSearch(false);
                setSearchExitTarget(null);
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
                    groups={GROUPS.map((g) => ({ ...g, cover: coverFor(g.id) }))}
                    onPick={(group) => {
                        setSelectedGroup(group);
                        setPhase("marqueeIntro");
                    }}
                    onRequestClose={() => window.dispatchEvent(new Event("close-overlay"))}
                />
            </StageFade>

            <IntroGate play={phase === "marqueeIntro"} onDone={() => setPhase("marquee")} persistBackdropAfter={true} />

            <StageFade show={phase === "marquee"}>
                <MarqueeGallery
                    key={`marquee-${effectiveGroup.id}`}
                    images={marqueeImages}
                    title={effectiveGroup.title}
                    visible={phase === "marquee"}
                    closing={closingStage !== "idle"}
                    onSlideOutDone={() => setClosingStage("panelOut")}
                    onRequestClose={() => window.dispatchEvent(new Event("close-overlay"))}
                />
            </StageFade>

            <IntroGate play={phase === "searchIntro"} onDone={() => setPhase("search")} persistBackdropAfter={true} />

            <StageFade
                show={phase === "search" && !closingSearch}
                exitY="120vh"
                onExitComplete={() => {
                    if (!closingSearch) return;
                    if (searchExitTarget === "choose") {
                        setClosingSearch(false);
                        setSearchExitTarget(null);

                        setNextAfterOverlayIn("choose");
                        setClosingStage("panelOut");
                        return;
                    }
                    if (searchExitTarget === "grid") {
                        setClosingSearch(false);
                        setSearchExitTarget(null);
                        setClosingStage("panelOut");
                    }
                }}
            >
                <SearchOverlay
                    groups={GROUPS}
                    imagesFrom={imagesFrom}
                    onRequestClose={() => window.dispatchEvent(new Event("close-overlay"))}
                />
            </StageFade>
        </OverlayShell>
    );
}

const overlapLayer = document.getElementById("overlapLayer");
if (overlapLayer) {
    createRoot(overlapLayer).render(<OverlayHost />);
}

const gridBtn = document.getElementById("gridButton");
const marqueeBtn = document.getElementById("marqueeButton");
const searchBtn = document.getElementById("searchButton");

gridBtn?.classList.add("active");
marqueeBtn?.classList.remove("active");
searchBtn?.classList?.remove("active");

window.addEventListener("open-overlay", () => {
    marqueeBtn?.classList.add("active");
    gridBtn?.classList.remove("active");
    searchBtn?.classList?.remove("active");
});
window.addEventListener("open-search-overlay", () => {
    searchBtn?.classList?.add("active");
    gridBtn?.classList.remove("active");
    marqueeBtn?.classList.remove("active");
});
window.addEventListener("close-overlay", () => {
    gridBtn?.classList.add("active");
    marqueeBtn?.classList.remove("active");
    searchBtn?.classList?.remove("active");
});

marqueeBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    window.dispatchEvent(new Event("open-overlay"));
});
gridBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    window.dispatchEvent(new Event("close-overlay"));
});
searchBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    window.dispatchEvent(new Event("open-search-overlay"));
});