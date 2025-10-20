# BIOTech Futures — Website & Gallery Prototype

This project is a **UI/UX redesign prototype** for the [BIOTech Futures](https://www.biotechfutures.org/) website, with a focus on a new **Gallery** experience. It demonstrates how React and modern design practices can be applied to build a clean, guideline-compliant, and maintainable website.

---

## Features

### Main Page
- **Brand-compliant design**: Dark green (#017151), charcoal text (#174243), Arial body font with italic accents.  
- **Responsive hero section**: Large background image with overlay, clear mission statement.  
- **Intro section**: Two-column layout with story + founder photo.  
- **Get involved cards**: Color-coded action cards linking to key areas (How to enter, Symposium, Work with us, Gallery).  
- **Consistent navigation**: Top navigation bar with Gallery link, search input, and login button.  
- **Footer**: Quick links and email subscription form.

### Gallery Page
- **Filter & search**: By keyword, category, and year.  
- **Dynamic grid layout**: Responsive gallery cards with hover effects.  
- **Lightbox view**: Click any photo → full-screen view with caption, tags, and navigation (keyboard accessible).  
- **Accessibility**: Keyboard shortcuts (Esc, ←, →), alt text for images, focus management.  
- **Reusable design tokens**: Shared brand colors and typography for consistency.

---

## Tech Stack

- [React 18 + Vite](https://vitejs.dev/) — fast development environment  
- [React Router DOM](https://reactrouter.com/) — client-side routing (`/` for main page, `/gallery` for gallery page)  
- [Tailwind CSS](https://tailwindcss.com/) — utility-first styling  
- [Lucide Icons](https://lucide.dev/) — modern icon set  

---

## Project Structure

biotech-gallery/  
├── public/  
│ └── vite.svg  
├── src/  
│ ├── assets/  
│ │ └── react.svg  
│ ├── App.css  
│ ├── App.jsx # App shell; renders routes  
│ ├── BTFGallery.tsx # Gallery page (TypeScript React)  
│ ├── declarations.d.ts # TS module declarations for images (*.png)  
│ ├── index.css # Tailwind/global styles  
│ ├── main.tsx # React root + BrowserRouter  
│ ├── MainPage.tsx # Main landing page  
│ ├── pic_mainPage.png # Hero image used on MainPage  
│ └── pic_mainPage2.png # (spare) local image  
├── .gitignore  
├── eslint.config.js  
├── index.html  
├── package-lock.json  
├── package.json  
├── README.md  
└── vite.config.js  

## Getting Started

1. **Clone this repo**  
   ```bash
   git clone git@github.sydney.edu.au:czha0443/SOFT3888_TH10_01_P012.git
   cd SOFT3888_TH10_01_P012
2. **Install dependencies**
    ```bash
    npm install
3. **Run the dev server**
    ```bash
    npm run dev
Then open http://localhost:5173.


# Jest testing

### Run every test
```bash
npm test
```

### Run test and generate coverage report
```bash
npm test -- --coverage
```
### Run test of specific component or page
```bash
# Run every test of QueenslandSatellite page
npm test -- --testPathPattern="QueenslandSatellite"
# Run every test of Timeline component
npm test -- --testPathPattern="Timeline.test.tsx"
```
### Run test and show detail information
```bash
npm test -- --verbose
```


## License 
This prototype is for educational and demonstration purposes only.