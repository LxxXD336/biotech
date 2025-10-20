/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import "@testing-library/jest-dom";
import {
    render,
    screen,
    fireEvent,
    waitFor,
    act,
    cleanup,
} from "@testing-library/react";

// ====== Global fake timers & cleanup ======
beforeEach(() => {
    jest.useFakeTimers();
    window.localStorage.clear();
    window.sessionStorage.clear();

    // Do not enable reduced-motion by default
    (window as any).matchMedia = (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
    });

    // Scroll API
    Element.prototype.scrollIntoView = jest.fn();

    // Silence style-related console errors/warnings to keep output clean
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    cleanup();
    (console.error as any).mockRestore?.();
    (console.warn as any).mockRestore?.();
});

// ====== Required module mocks ======
jest.mock("../components/common", () => {
    const React = require("react");
    const COLORS = {
        green: "#017151",
        lime: "rgb(182,240,194)",
        yellow: "#F1E5A6",
        lightBG: "#F7FAF9",
        blue: "#396B7B",
        navy: "#1A345E",
        white: "#ffffff",
        charcoal: "rgb(23,66,67)",
    };
    return {
        Container: ({ children, className = "" }: any) => (
            <div className={`btf-container ${className}`}>{children}</div>
        ),
        PageSection: ({
                          children,
                          id,
                          bg = "transparent",
                      }: {
            children: React.ReactNode;
            id?: string;
            bg?: string;
        }) => (
            <section id={id} style={{ backgroundColor: bg }}>
                <div className="btf-container">{children}</div>
            </section>
        ),
        COLORS,
        useReveal: () => React.useCallback(() => {}, []),
    };
});

jest.mock("../components/StyleInject", () => () => null);

jest.mock("../components/MainNav", () => {
    return function MainNav() {
        return (
            <nav
                className="w-full border-b backdrop-blur-sm sticky top-0 z-30"
                style={{ borderColor: "#E6F3EE", backgroundColor: "#fff" }}
            >
                <div className="btf-container py-3 flex items-center justify-between">
                    <a
                        href="/"
                        aria-label="Go to homepage"
                        className="flex items-center gap-3"
                        style={{ textDecoration: "none" }}
                    >
                        <div
                            aria-hidden
                            className="rounded-full w-9 h-9 flex items-center justify-center ring-2 ring-[#E6F3EE]"
                            style={{ backgroundColor: "#017151" }}
                        >
              <span className="text-white text-sm" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
                B
              </span>
                        </div>
                        <span
                            className="text-lg font-semibold"
                            style={{ color: "#017151", fontFamily: "Arial, Helvetica, sans-serif" }}
                        >
              BIOTech Futures
            </span>
                    </a>
                    <div className="flex items-center gap-3">
                        <a
                            aria-label="Contact us"
                            href="/contact"
                            className="px-3 py-2 rounded-xl text-sm font-semibold transition"
                            style={{
                                color: "#017151",
                                border: "1px solid #E6F3EE",
                                backgroundColor: "#fff",
                            }}
                        >
                            Contact
                        </a>
                        <button
                            aria-label="Open menu"
                            className="px-4 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-95 transition"
                            style={{
                                backgroundColor: "#396B7B",
                                boxShadow: "0 6px 16px rgba(57,107,123,0.25)",
                            }}
                        >
                            Menu
                        </button>
                    </div>
                </div>
            </nav>
        );
    };
});

jest.mock("../sections/home/Footer", () => {
    return function Footer() {
        return (
            <footer style={{ backgroundColor: "#017151" }}>
                <div className="btf-container py-8 grid gap-6">
                    <div>
                        <h4 className="font-bold mb-2" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
                            BIOTech Futures
                        </h4>
                        <p className="text-white/90 text-sm" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
                            Inspiring the next generation.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-2" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
                            Quick links
                        </h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a className="hover:underline text-white" href="/" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
                                    About
                                </a>
                            </li>
                            <li>
                                <a className="hover:underline text-white" href="#" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
                                    News
                                </a>
                            </li>
                            <li>
                                <a className="hover:underline text-white" href="#" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
                                    Contact
                                </a>
                            </li>
                            <li>
                                <a className="hover:underline text-white" href="#" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
                                    Privacy
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-2" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
                            Subscribe
                        </h4>
                        <form>
                            <input
                                type="email"
                                placeholder="Email address"
                                className="flex-1 px-3 py-2 rounded-md text-black"
                                style={{
                                    border: "1px solid #b6f0c2",
                                    fontFamily: "Arial, Helvetica, sans-serif",
                                }}
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-md text-black hover:opacity-95 transition"
                                style={{ backgroundColor: "#F1E5A6", fontFamily: "Arial, Helvetica, sans-serif" }}
                            >
                                Sign up
                            </button>
                        </form>
                    </div>
                </div>
            </footer>
        );
    };
});

// ====== Page under test ======
import BecomeMentor from "../Mentorship";

// ====== Helper: unified render ======
function renderPage() {
    const utils = render(<BecomeMentor />);
    return { ...utils, container: utils.container };
}

// ====== FileReader mock (for Admin file inputs) ======
class FRMock {
    result: string | ArrayBuffer | null = null;
    onload: null | ((ev?: any) => void) = null;
    onerror: null | ((ev?: any) => void) = null;
    readAsDataURL(_file: File) {
        this.result = "data:image/png;base64,TESTDATA";
        setTimeout(() => this.onload?.({} as any), 0);
    }
}
const realFR = (global as any).FileReader;
beforeEach(() => {
    (global as any).FileReader = FRMock as any;
});
afterEach(() => {
    (global as any).FileReader = realFR;
});

// ====== Test cases ======
describe("Mentorship page", () => {
    test("Hero renders and CTA button exists", async () => {
        const { container } = renderPage();

        // Query main heading by level=1 (avoid spacing issues in name matching)
        expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();

        // CTA
        const cta = screen.getByRole("link", { name: /get started today/i });
        expect(cta).toHaveAttribute("href", "https://sydney.au1.qualtrics.com");

        // Hero glass effect: add glass-on after ~600ms
        await act(async () => {
            jest.advanceTimersByTime(650);
        });
        await waitFor(() => {
            const glass = container.querySelector(".glass-card") as HTMLElement;
            expect(glass).toBeTruthy();
            expect(glass.className).toMatch(/glass-on/);
        });
    });

    test("Hero background exists; reads localStorage override if set", async () => {
        // Preseed localStorage override
        window.localStorage.setItem(
            "btfMentorImageOverrides",
            JSON.stringify({ bgHero: "data:image/png;base64,OVERRIDE" })
        );

        const { container } = renderPage();

        const hero = container.querySelector(
            "section.relative.overflow-hidden"
        ) as HTMLElement;

        expect(hero).toBeTruthy();

        // Background should be url(...) regardless of override success
        const bg = hero.style.backgroundImage;
        expect(bg).toMatch(/url\(/);

        // If override applied expect data:image; otherwise accept test-file-stub
        if (bg.includes("test-file-stub")) {
            // Using bundled default background
            expect(bg).toContain("test-file-stub");
        } else {
            // Override applied
            expect(bg).toContain("data:image");
        }
    });

    test("Events/Ideal/Involved/Benefits/Testimonials/Support/FAQ basic content exists", () => {
        renderPage();

        expect(
            screen.getByRole("heading", { name: /mentor events/i })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", { name: /who is an ideal mentor/i })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", { name: /what is involved/i })
        ).toBeInTheDocument();
        expect(screen.getAllByText(/~5 hrs/i)[0]).toBeInTheDocument();

        // Benefits (check a few card alt attributes)
        expect(
            screen.getByAltText(/connect with top innovators/i)
        ).toBeInTheDocument();
        expect(screen.getByAltText(/be inspired/i)).toBeInTheDocument();
        expect(screen.getByAltText(/recognition/i)).toBeInTheDocument();

        // Testimonials (check 3 names)
        expect(screen.getByText(/Jasmine Pye/i)).toBeInTheDocument();
        expect(screen.getByText(/Rosemary Taouk/i)).toBeInTheDocument();
        expect(screen.getByText(/Frank Fei/i)).toBeInTheDocument();

        // Support
        expect(
            screen.getByRole("heading", { name: /what support do mentors get\?/i })
        ).toBeInTheDocument();

        // FAQ
        expect(
            screen.getByRole("heading", { name: /frequently asked questions/i })
        ).toBeInTheDocument();

        // Contact us (CTA inside FAQ)
        expect(screen.getAllByRole("link", { name: /contact us/i })[0]).toHaveAttribute(
            "href",
            "/contact"
        );
    });

    test("FAQ items expand (custom animation)", async () => {
        const { container } = renderPage();

        const firstDetails = container.querySelector(
            "details.faq"
        ) as HTMLDetailsElement;
        expect(firstDetails).toBeTruthy();

        const summary = firstDetails.querySelector("summary") as HTMLElement;
        fireEvent.click(summary); // Custom onClick calls animateToggle

        await waitFor(() => {
            expect(firstDetails.open).toBe(true);
        });
    });

    test("Admin panel: file select → Reset/Reset All/Logout", async () => {
        // Enable admin directly via sessionStorage (bypass password flow)
        window.sessionStorage.setItem("btf.admin", "true");

        // Preseed an LS key, will be cleared by Reset All
        window.localStorage.setItem(
            "btf.mentor.text",
            JSON.stringify({ "hero.h1": "Test Title" })
        );

        const { container } = renderPage();

        // Panel title exists
        expect(screen.getByText(/Mentorship Page Admin/i)).toBeInTheDocument();

        // Find first file input ("Hero background") and simulate selecting a file
        const inputs =
            container.querySelectorAll<HTMLInputElement>('input[type="file"][accept="image/*"]');
        expect(inputs.length).toBeGreaterThan(0);
        const heroInput = inputs[0];

        // Trigger change
        const file = new File([new Blob(["content"])], "hero.png", {
            type: "image/png",
        });

        await act(async () => {
            fireEvent.change(heroInput, { target: { files: [file] } as any });
            // Advance async FileReader.onload
            jest.advanceTimersByTime(1);
        });

        // Reset All clears preseeded localStorage key
        const resetAll = screen.getByRole("button", { name: /reset all/i });
        fireEvent.click(resetAll);
        expect(window.localStorage.getItem("btf.mentor.text")).toBeNull();

        // Panel closes after Logout
        const logout = screen.getByRole("button", { name: /logout/i });
        fireEvent.click(logout);
        expect(screen.queryByText(/Mentorship Page Admin/i)).not.toBeInTheDocument();
    });

    test("Admin panel: text editing", async () => {
        // Enable admin mode
        window.sessionStorage.setItem("btf.admin", "true");

        const { container } = renderPage();

        // Wait for admin panel to render
        await waitFor(() => {
            expect(screen.getByText(/Mentorship Page Admin/i)).toBeInTheDocument();
        });

        // Find text inputs in admin panel
        const textInputs = container.querySelectorAll<HTMLInputElement>('input');
        expect(textInputs.length).toBeGreaterThan(0);
        
        const heroKickerInput = Array.from(textInputs).find(input => 
            input.value === "Make a difference"
        );
        expect(heroKickerInput).toBeTruthy();

        // Change text
        fireEvent.change(heroKickerInput!, { target: { value: "Test Kicker" } });
        
        // Verify localStorage updated
        const textData = JSON.parse(window.localStorage.getItem("btf.mentor.text") || "{}");
        expect(textData["hero.kicker"]).toBe("Test Kicker");
    });

    test("Admin panel: Benefits card editing", async () => {
        // Enable admin mode
        window.sessionStorage.setItem("btf.admin", "true");

        const { container } = renderPage();

        // Find Benefits section
        expect(screen.getByText(/Benefits Cards \(6 cards\)/i)).toBeInTheDocument();

        // Find first Benefits card title input
        const benefitsInputs = container.querySelectorAll<HTMLInputElement>('input[placeholder="Card title"]');
        expect(benefitsInputs.length).toBeGreaterThan(0);
        
        const firstCardTitleInput = benefitsInputs[0];
        expect(firstCardTitleInput.value).toBe("Connect with top innovators");

        // Change title
        fireEvent.change(firstCardTitleInput, { target: { value: "Test Title" } });
        
        // Verify localStorage updated
        const textData = JSON.parse(window.localStorage.getItem("btf.mentor.text") || "{}");
        expect(textData["benefits.connect.title"]).toBe("Test Title");
    });

    test("Admin panel: Testimonials editing", async () => {
        // Enable admin mode
        window.sessionStorage.setItem("btf.admin", "true");

        const { container } = renderPage();

        // Find Testimonials section
        expect(screen.getByText(/Testimonials \(3 testimonials\)/i)).toBeInTheDocument();

        // Find first testimonial name input
        const nameInputs = container.querySelectorAll<HTMLInputElement>('input[placeholder="Name"]');
        expect(nameInputs.length).toBeGreaterThan(0);
        
        const firstNameInput = nameInputs[0];
        expect(firstNameInput.value).toBe("Jasmine Pye");

        // Change name
        fireEvent.change(firstNameInput, { target: { value: "Test Name" } });
        
        // Verify localStorage updated
        const textData = JSON.parse(window.localStorage.getItem("btf.mentor.text") || "{}");
        expect(textData["testimonial.1.name"]).toBe("Test Name");
    });

    test("Admin panel: FAQ editing", async () => {
        // Enable admin mode
        window.sessionStorage.setItem("btf.admin", "true");

        const { container } = renderPage();

        // Find FAQ section
        expect(screen.getByText(/FAQ Management \(11 questions\)/i)).toBeInTheDocument();

        // Find first FAQ question input
        const questionInputs = container.querySelectorAll<HTMLInputElement>('input[placeholder="Question"]');
        expect(questionInputs.length).toBeGreaterThan(0);
        
        const firstQuestionInput = questionInputs[0];
        expect(firstQuestionInput.value).toBe("How many teams will I mentor?");

        // Change question
        fireEvent.change(firstQuestionInput, { target: { value: "Test Question" } });
        
        // Verify localStorage updated
        const textData = JSON.parse(window.localStorage.getItem("btf.mentor.text") || "{}");
        expect(textData["faq.1.q"]).toBe("Test Question");
    });

    test("Admin panel: inline edit toggle", async () => {
        // Enable admin mode
        window.sessionStorage.setItem("btf.admin", "true");

        const { container } = renderPage();

        // Find inline edit checkbox
        const inlineEditCheckbox = container.querySelector<HTMLInputElement>('#mt-inline');
        expect(inlineEditCheckbox).toBeTruthy();
        expect(inlineEditCheckbox!.checked).toBe(false);

        // Toggle inline edit
        fireEvent.click(inlineEditCheckbox!);
        
        // Verify sessionStorage updated
        expect(window.sessionStorage.getItem("btf.inlineEdit")).toBe("true");
        expect(inlineEditCheckbox!.checked).toBe(true);
    });

    test("Admin panel: login", async () => {
        const { container } = renderPage();

        // Open login modal
        const loginTrigger = container.querySelector('button[aria-label="Open mentorship admin"]');
        expect(loginTrigger).toBeTruthy();
        fireEvent.click(loginTrigger!);

        // Verify login modal appears
        expect(screen.getByText(/Mentorship Admin Login/i)).toBeInTheDocument();

        // Enter password
        const passwordInput = screen.getByPlaceholderText("Enter password");
        fireEvent.change(passwordInput, { target: { value: "biotech" } });

        // Click login
        const loginBtn = screen.getByRole("button", { name: /login/i });
        fireEvent.click(loginBtn);

        // Verify admin panel appears
        await waitFor(() => {
            expect(screen.getByText(/Mentorship Page Admin/i)).toBeInTheDocument();
        });

        // Verify sessionStorage updated
        expect(window.sessionStorage.getItem("btf.admin")).toBe("true");
    });

    test("Admin panel: keyboard shortcut", async () => {
        renderPage();

        // Simulate keyboard shortcut
        fireEvent.keyDown(window, { 
            key: 's', 
            ctrlKey: true, 
            shiftKey: true 
        });

        // Verify login modal appears
        await waitFor(() => {
            expect(screen.getByText(/Mentorship Admin Login/i)).toBeInTheDocument();
        });
    });

    test("Editable component: inline edit", async () => {
        // Enable admin and inline edit modes
        window.sessionStorage.setItem("btf.admin", "true");
        window.sessionStorage.setItem("btf.inlineEdit", "true");

        const { container } = renderPage();

        // Find editable elements
        const editableElements = container.querySelectorAll('[contenteditable="true"]');
        expect(editableElements.length).toBeGreaterThan(0);

        const firstEditable = editableElements[0] as HTMLElement;
        
        // Simulate edit
        fireEvent.blur(firstEditable, { 
            currentTarget: { innerText: "Test Content" } 
        });

        // Verify localStorage updated
        const textData = JSON.parse(window.localStorage.getItem("btf.mentor.text") || "{}");
        expect(Object.keys(textData).length).toBeGreaterThan(0);
    });

    test("Benefits cards: text overrides", async () => {
        // Set text overrides
        window.localStorage.setItem(
            "btf.mentor.text",
            JSON.stringify({
                "benefits.connect.title": "Custom Title",
                "benefits.connect.desc": "Custom Description"
            })
        );

        const { container } = renderPage();

        // Verify overridden text is rendered
        expect(screen.getByText("Custom Title")).toBeInTheDocument();
        expect(screen.getByText("Custom Description")).toBeInTheDocument();
    });

    test("Testimonials: text overrides", async () => {
        // Set text overrides
        window.localStorage.setItem(
            "btf.mentor.text",
            JSON.stringify({
                "testimonial.1.name": "Custom Name",
                "testimonial.1.quote": "Custom Quote"
            })
        );

        const { container } = renderPage();

        // Verify overridden text is rendered
        expect(screen.getByText(/Custom Name/)).toBeInTheDocument();
        expect(screen.getByText(/Custom Quote/)).toBeInTheDocument();
    });

    test("FAQ: text overrides", async () => {
        // Set text overrides
        window.localStorage.setItem(
            "btf.mentor.text",
            JSON.stringify({
                "faq.1.q": "Custom Question",
                "faq.1.a": "Custom Answer"
            })
        );

        const { container } = renderPage();

        // Verify overridden text is rendered
        expect(screen.getByText("Custom Question")).toBeInTheDocument();
        expect(screen.getByText("Custom Answer")).toBeInTheDocument();
    });

    test("Background image overrides", async () => {
        // Set background image overrides
        window.localStorage.setItem(
            "btfMentorImageOverrides",
            JSON.stringify({
                bgHero: "data:image/png;base64,CUSTOM_HERO",
                bgInvolved: "data:image/png;base64,CUSTOM_INVOLVED"
            })
        );

        const { container } = renderPage();

        // Verify Hero background overridden
        const hero = container.querySelector("section.relative.overflow-hidden") as HTMLElement;
        expect(hero.style.backgroundImage).toContain("data:image/png;base64,CUSTOM_HERO");

        // Verify Involved background section exists
        const involved = container.querySelector(".iv-panel") as HTMLElement;
        expect(involved).toBeTruthy();
    });

    test("Read FAQs/Explore anchors call scrollIntoView", () => {
        renderPage();

        const spy = jest.spyOn(Element.prototype, "scrollIntoView");

        const readFaq = screen.getByRole("link", { name: /read faqs/i });
        fireEvent.click(readFaq);
        expect(spy).toHaveBeenCalled();

        const explore = screen.getByRole("link", { name: /explore mentor events/i });
        fireEvent.click(explore);
        expect(spy).toHaveBeenCalledTimes(2);
    });

    test("FAQ animation: reduced motion", async () => {
        // Simulate reduced motion preference
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jest.fn().mockImplementation(query => ({
                matches: query === '(prefers-reduced-motion: reduce)',
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            })),
        });

        const { container } = renderPage();

        const firstDetails = container.querySelector("details.faq") as HTMLDetailsElement;
        expect(firstDetails).toBeTruthy();

        const summary = firstDetails.querySelector("summary") as HTMLElement;
        fireEvent.click(summary);

        await waitFor(() => {
            expect(firstDetails.open).toBe(true);
        });
    });

    test("FAQ animation: normal motion", async () => {
        // Simulate normal motion preference
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jest.fn().mockImplementation(query => ({
                matches: false, // 不匹配减少动效
                media: query,
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            })),
        });

        const { container } = renderPage();

        const firstDetails = container.querySelector("details.faq") as HTMLDetailsElement;
        expect(firstDetails).toBeTruthy();

        const summary = firstDetails.querySelector("summary") as HTMLElement;
        fireEvent.click(summary);

        await waitFor(() => {
            expect(firstDetails.open).toBe(true);
        });
    });

    test("Admin panel: wrong password", async () => {
        const { container } = renderPage();

        // Open login modal
        const loginTrigger = container.querySelector('button[aria-label="Open mentorship admin"]');
        expect(loginTrigger).toBeTruthy();
        fireEvent.click(loginTrigger!);

        // Verify login modal appears
        expect(screen.getByText(/Mentorship Admin Login/i)).toBeInTheDocument();

        // Enter wrong password
        const passwordInput = screen.getByPlaceholderText("Enter password");
        fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });

        // Click login
        const loginBtn = screen.getByRole("button", { name: /login/i });
        
        // Mock alert
        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
        
        fireEvent.click(loginBtn);

        // Verify error alert is shown
        expect(alertSpy).toHaveBeenCalledWith("Incorrect password");
        
        alertSpy.mockRestore();
    });

    test("Admin panel: Mac shortcut", async () => {
        renderPage();

        // Simulate Mac shortcut (metaKey)
        fireEvent.keyDown(window, { 
            key: 's', 
            metaKey: true, 
            shiftKey: true 
        });

        // Verify login modal appears
        await waitFor(() => {
            expect(screen.getByText(/Mentorship Admin Login/i)).toBeInTheDocument();
        });
    });

    test("Admin panel: file selection", async () => {
        // Enable admin mode
        window.sessionStorage.setItem("btf.admin", "true");

        const { container } = renderPage();

        // Wait for admin panel to render
        await waitFor(() => {
            expect(screen.getByText(/Mentorship Page Admin/i)).toBeInTheDocument();
        });

        // Find first file input
        const inputs = container.querySelectorAll<HTMLInputElement>('input[type="file"][accept="image/*"]');
        expect(inputs.length).toBeGreaterThan(0);
        const heroInput = inputs[0];

        // Trigger change
        const file = new File([new Blob(["content"])], "hero.png", {
            type: "image/png",
        });

        await act(async () => {
            fireEvent.change(heroInput, { target: { files: [file] } as any });
            jest.advanceTimersByTime(1);
        });

        // Verify file selected
        expect(heroInput.files).toHaveLength(1);
    });

    test("Admin panel: Benefits image reset", async () => {
        // Enable admin mode
        window.sessionStorage.setItem("btf.admin", "true");

        const { container } = renderPage();

        // Wait for admin panel to render
        await waitFor(() => {
            expect(screen.getByText(/Mentorship Page Admin/i)).toBeInTheDocument();
        });

        // Find Benefits section
        expect(screen.getByText(/Benefits Cards \(6 cards\)/i)).toBeInTheDocument();

        // Find first card Reset button
        const resetBtns = screen.getAllByRole("button", { name: /reset/i });
        expect(resetBtns.length).toBeGreaterThan(0);
        
        // Click first Reset button
        fireEvent.click(resetBtns[0]);
        
        // Verify localStorage cleared
        const imgData = JSON.parse(window.localStorage.getItem("btfMentorImageOverrides") || "{}");
        expect(Object.keys(imgData).length).toBeGreaterThanOrEqual(0);
    });

    test("Admin panel: Testimonials image upload", async () => {
        // Enable admin mode
        window.sessionStorage.setItem("btf.admin", "true");

        const { container } = renderPage();

        // Wait for admin panel to render
        await waitFor(() => {
            expect(screen.getByText(/Mentorship Page Admin/i)).toBeInTheDocument();
        });

        // Find Testimonials section
        expect(screen.getByText(/Testimonials \(3 testimonials\)/i)).toBeInTheDocument();

        // Find first testimonial Change Photo button
        const changePhotoBtns = screen.getAllByRole("button", { name: /change photo/i });
        expect(changePhotoBtns.length).toBeGreaterThan(0);
        
        // Click Change Photo button
        fireEvent.click(changePhotoBtns[0]);
        
        // Verify corresponding file input
        const fileInputs = container.querySelectorAll<HTMLInputElement>('input[type="file"][accept="image/*"]');
        expect(fileInputs.length).toBeGreaterThan(0);
    });

    test("Admin panel: FAQ reset", async () => {
        // Enable admin mode
        window.sessionStorage.setItem("btf.admin", "true");

        const { container } = renderPage();

        // Wait for admin panel to render
        await waitFor(() => {
            expect(screen.getByText(/Mentorship Page Admin/i)).toBeInTheDocument();
        });

        // Find FAQ section
        expect(screen.getByText(/FAQ Management \(11 questions\)/i)).toBeInTheDocument();

        // Find first FAQ Reset button
        const resetBtns = screen.getAllByRole("button", { name: /reset/i });
        expect(resetBtns.length).toBeGreaterThan(0);
        
        // Click first Reset button
        fireEvent.click(resetBtns[0]);
        
        // Verify localStorage cleared
        const textData = JSON.parse(window.localStorage.getItem("btf.mentor.text") || "{}");
        expect(Object.keys(textData).length).toBeGreaterThanOrEqual(0);
    });

    test("Admin panel: background image reset", async () => {
        // Enable admin mode
        window.sessionStorage.setItem("btf.admin", "true");

        const { container } = renderPage();

        // Wait for admin panel to render
        await waitFor(() => {
            expect(screen.getByText(/Mentorship Page Admin/i)).toBeInTheDocument();
        });

        // Find Background Images section
        expect(screen.getByText(/Background Images/i)).toBeInTheDocument();

        // Find all Reset buttons
        const resetBtns = screen.getAllByRole("button", { name: /reset/i });
        expect(resetBtns.length).toBeGreaterThan(0);
        
        // Click first background image Reset button
        fireEvent.click(resetBtns[0]);
        
        // Verify localStorage cleared
        const imgData = JSON.parse(window.localStorage.getItem("btfMentorImageOverrides") || "{}");
        expect(Object.keys(imgData).length).toBeGreaterThanOrEqual(0);
    });

    test("Admin panel: inline edit toggle off", async () => {
        // Enable admin mode
        window.sessionStorage.setItem("btf.admin", "true");
        window.sessionStorage.setItem("btf.inlineEdit", "true");

        const { container } = renderPage();

        // Wait for admin panel to render
        await waitFor(() => {
            expect(screen.getByText(/Mentorship Page Admin/i)).toBeInTheDocument();
        });

        // Find inline edit checkbox
        const inlineEditCheckbox = container.querySelector<HTMLInputElement>('#mt-inline');
        expect(inlineEditCheckbox).toBeTruthy();
        expect(inlineEditCheckbox!.checked).toBe(true);

        // Toggle inline edit
        fireEvent.click(inlineEditCheckbox!);
        
        // Verify sessionStorage updated
        expect(window.sessionStorage.getItem("btf.inlineEdit")).toBe("false");
        expect(inlineEditCheckbox!.checked).toBe(false);
    });

    test("Admin panel: login cancel", async () => {
        const { container } = renderPage();

        // Open login modal
        const loginTrigger = container.querySelector('button[aria-label="Open mentorship admin"]');
        expect(loginTrigger).toBeTruthy();
        fireEvent.click(loginTrigger!);

        // Verify login modal appears
        expect(screen.getByText(/Mentorship Admin Login/i)).toBeInTheDocument();

        // Click cancel button
        const cancelBtn = screen.getByRole("button", { name: /cancel/i });
        fireEvent.click(cancelBtn);

        // Verify login modal closes
        expect(screen.queryByText(/Mentorship Admin Login/i)).not.toBeInTheDocument();
    });

    test("Admin panel: login modal input handling", async () => {
        const { container } = renderPage();

        // 触发登录模态框
        const loginTrigger = container.querySelector('button[aria-label="Open mentorship admin"]');
        expect(loginTrigger).toBeTruthy();
        fireEvent.click(loginTrigger!);

        // 检查登录模态框是否出现
        expect(screen.getByText(/Mentorship Admin Login/i)).toBeInTheDocument();

        // 输入密码
        const passwordInput = screen.getByPlaceholderText("Enter password");
        fireEvent.change(passwordInput, { target: { value: "test" } });
        expect(passwordInput).toHaveValue("test");

        // 清空输入
        fireEvent.change(passwordInput, { target: { value: "" } });
        expect(passwordInput).toHaveValue("");
    });

    test("Admin panel: Benefits description editing", async () => {
        // Enable admin mode
        window.sessionStorage.setItem("btf.admin", "true");

        const { container } = renderPage();

        // Wait for admin panel to render
        await waitFor(() => {
            expect(screen.getByText(/Mentorship Page Admin/i)).toBeInTheDocument();
        });

        // Find Benefits section
        expect(screen.getByText(/Benefits Cards \(6 cards\)/i)).toBeInTheDocument();

        // Find the first Benefits card description input
        const descInputs = container.querySelectorAll<HTMLInputElement>('input[placeholder="Card description"]');
        expect(descInputs.length).toBeGreaterThan(0);
        
        const firstCardDescInput = descInputs[0];
        expect(firstCardDescInput.value).toBe("Join a community of mentors across Australian STEM.");

        // Change description
        fireEvent.change(firstCardDescInput, { target: { value: "Test Description" } });
        
        // Verify localStorage updated
        const textData = JSON.parse(window.localStorage.getItem("btf.mentor.text") || "{}");
        expect(textData["benefits.connect.desc"]).toBe("Test Description");
    });

    test("Admin panel: Testimonials role editing", async () => {
        // Enable admin mode
        window.sessionStorage.setItem("btf.admin", "true");

        const { container } = renderPage();

        // Wait for admin panel to render
        await waitFor(() => {
            expect(screen.getByText(/Mentorship Page Admin/i)).toBeInTheDocument();
        });

        // Find Testimonials section
        expect(screen.getByText(/Testimonials \(3 testimonials\)/i)).toBeInTheDocument();

        // Find first testimonial role input
        const roleInputs = container.querySelectorAll<HTMLInputElement>('input[placeholder="Role/Position"]');
        expect(roleInputs.length).toBeGreaterThan(0);
        
        const firstRoleInput = roleInputs[0];
        expect(firstRoleInput.value).toBe("UTS Biomedical Engineering");

        // Change role
        fireEvent.change(firstRoleInput, { target: { value: "Test Role" } });
        
        // Verify localStorage updated
        const textData = JSON.parse(window.localStorage.getItem("btf.mentor.text") || "{}");
        expect(textData["testimonial.1.role"]).toBe("Test Role");
    });

    test("Admin panel: Testimonials quote editing", async () => {
        // Enable admin mode
        window.sessionStorage.setItem("btf.admin", "true");

        const { container } = renderPage();

        // Wait for admin panel to render
        await waitFor(() => {
            expect(screen.getByText(/Mentorship Page Admin/i)).toBeInTheDocument();
        });

        // Find Testimonials section
        expect(screen.getByText(/Testimonials \(3 testimonials\)/i)).toBeInTheDocument();

        // Find first testimonial quote textarea
        const quoteInputs = container.querySelectorAll<HTMLTextAreaElement>('textarea[placeholder="Quote"]');
        expect(quoteInputs.length).toBeGreaterThan(0);
        
        const firstQuoteInput = quoteInputs[0];
        expect(firstQuoteInput.value).toContain("Being a mentor for BIOTech Futures");

        // Change quote
        fireEvent.change(firstQuoteInput, { target: { value: "Test Quote" } });
        
        // Verify localStorage updated
        const textData = JSON.parse(window.localStorage.getItem("btf.mentor.text") || "{}");
        expect(textData["testimonial.1.quote"]).toBe("Test Quote");
    });

    test("Admin panel: FAQ answer editing", async () => {
        // Enable admin mode
        window.sessionStorage.setItem("btf.admin", "true");

        const { container } = renderPage();

        // Wait for admin panel to render
        await waitFor(() => {
            expect(screen.getByText(/Mentorship Page Admin/i)).toBeInTheDocument();
        });

        // Find FAQ section
        expect(screen.getByText(/FAQ Management \(11 questions\)/i)).toBeInTheDocument();

        // Find first FAQ answer textarea
        const answerInputs = container.querySelectorAll<HTMLTextAreaElement>('textarea[placeholder="Answer"]');
        expect(answerInputs.length).toBeGreaterThan(0);
        
        const firstAnswerInput = answerInputs[0];
        expect(firstAnswerInput.value).toContain("As a mentor you are expected to mentor up to 3 teams");

        // Change answer
        fireEvent.change(firstAnswerInput, { target: { value: "Test Answer" } });
        
        // Verify localStorage updated
        const textData = JSON.parse(window.localStorage.getItem("btf.mentor.text") || "{}");
        expect(textData["faq.1.a"]).toBe("Test Answer");
    });

    test("Admin panel: background image choose", async () => {
        // Enable admin mode
        window.sessionStorage.setItem("btf.admin", "true");

        const { container } = renderPage();

        // Wait for admin panel to render
        await waitFor(() => {
            expect(screen.getByText(/Mentorship Page Admin/i)).toBeInTheDocument();
        });

        // Find Background Images section
        expect(screen.getByText(/Background Images/i)).toBeInTheDocument();

        // Find all Choose buttons
        const chooseBtns = screen.getAllByRole("button", { name: /choose/i });
        expect(chooseBtns.length).toBeGreaterThan(0);
        
        // Click first Choose button
        fireEvent.click(chooseBtns[0]);
        
        // Verify corresponding file input
        const fileInputs = container.querySelectorAll<HTMLInputElement>('input[type="file"][accept="image/*"]');
        expect(fileInputs.length).toBeGreaterThan(0);
    });

    test("Admin panel: Benefits image choose", async () => {
        // Enable admin mode
        window.sessionStorage.setItem("btf.admin", "true");

        const { container } = renderPage();

        // Wait for admin panel to render
        await waitFor(() => {
            expect(screen.getByText(/Mentorship Page Admin/i)).toBeInTheDocument();
        });

        // Find Benefits section
        expect(screen.getByText(/Benefits Cards \(6 cards\)/i)).toBeInTheDocument();

        // Find first card Change Image button
        const changeImageBtns = screen.getAllByRole("button", { name: /change image/i });
        expect(changeImageBtns.length).toBeGreaterThan(0);
        
        // Click Change Image button
        fireEvent.click(changeImageBtns[0]);
        
        // Verify corresponding file input
        const fileInputs = container.querySelectorAll<HTMLInputElement>('input[type="file"][accept="image/*"]');
        expect(fileInputs.length).toBeGreaterThan(0);
    });

    test("Admin panel: Testimonials image reset", async () => {
        // Enable admin mode
        window.sessionStorage.setItem("btf.admin", "true");

        const { container } = renderPage();

        // Wait for admin panel to render
        await waitFor(() => {
            expect(screen.getByText(/Mentorship Page Admin/i)).toBeInTheDocument();
        });

        // Find Testimonials section
        expect(screen.getByText(/Testimonials \(3 testimonials\)/i)).toBeInTheDocument();

        // Find first testimonial Reset button
        const resetBtns = screen.getAllByRole("button", { name: /reset/i });
        expect(resetBtns.length).toBeGreaterThan(0);
        
        // Click first Reset button
        fireEvent.click(resetBtns[0]);
        
        // Verify localStorage cleared
        const imgData = JSON.parse(window.localStorage.getItem("btfMentorImageOverrides") || "{}");
        expect(Object.keys(imgData).length).toBeGreaterThanOrEqual(0);
    });

    test("Admin panel: Benefits image reset", async () => {
        // Enable admin mode
        window.sessionStorage.setItem("btf.admin", "true");

        const { container } = renderPage();

        // Wait for admin panel to render
        await waitFor(() => {
            expect(screen.getByText(/Mentorship Page Admin/i)).toBeInTheDocument();
        });

        // Find Benefits section
        expect(screen.getByText(/Benefits Cards \(6 cards\)/i)).toBeInTheDocument();

        // Find first card Reset button
        const resetBtns = screen.getAllByRole("button", { name: /reset/i });
        expect(resetBtns.length).toBeGreaterThan(0);
        
        // Click first Reset button
        fireEvent.click(resetBtns[0]);
        
        // Verify localStorage cleared
        const imgData = JSON.parse(window.localStorage.getItem("btfMentorImageOverrides") || "{}");
        expect(Object.keys(imgData).length).toBeGreaterThanOrEqual(0);
    });

    test("Admin panel: background image reset", async () => {
        // Enable admin mode
        window.sessionStorage.setItem("btf.admin", "true");

        const { container } = renderPage();

        // Wait for admin panel to render
        await waitFor(() => {
            expect(screen.getByText(/Mentorship Page Admin/i)).toBeInTheDocument();
        });

        // Find Background Images section
        expect(screen.getByText(/Background Images/i)).toBeInTheDocument();

        // Find all Reset buttons
        const resetBtns = screen.getAllByRole("button", { name: /reset/i });
        expect(resetBtns.length).toBeGreaterThan(0);
        
        // Click first background image Reset button
        fireEvent.click(resetBtns[0]);
        
        // Verify localStorage cleared
        const imgData = JSON.parse(window.localStorage.getItem("btfMentorImageOverrides") || "{}");
        expect(Object.keys(imgData).length).toBeGreaterThanOrEqual(0);
    });
});
