import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Editable } from "../../components/SatelliteAdminPanel";
import shoesImg from "../../VictoriaSatelliteResource/1shoesPJ.png";
import chairImg from "../../VictoriaSatelliteResource/2ChairPJ.png";
import vesselImg from "../../VictoriaSatelliteResource/3VesselPJ.png";
import backImg from "../../VictoriaSatelliteResource/4BackPJ.png";
import shoulderImg from "../../VictoriaSatelliteResource/5ShoulderPJ.png";
import implantsImg from "../../VictoriaSatelliteResource/6ImplantsPJ.png";
import skiingImg from "../../VictoriaSatelliteResource/7SkiingPJ.png";
import suitImg from "../../VictoriaSatelliteResource/8SuitPJ.png";
import stemImg from "../../VictoriaSatelliteResource/9StemPJ.png";
import microbesImg from "../../VictoriaSatelliteResource/10MircrobesPJ.png";
import stentAntennaImg from "../../VictoriaSatelliteResource/11Stent-antennaPJ.png";
import brainImg from "../../VictoriaSatelliteResource/12BrainPJ.png";




const projects = [
    { id: 1,
      title: "Reducing the guesswork when selecting a new pair of children’s shoes",
      author: "Dr Dale Robinson, Research Fellow",
      summary: "The most common constraint when choosing new shoes is comfort. However, shoes have many other import effects such as altering the way we walk, yet this relationship is rarely considered at the time of purchase. Shoe selection is even more challenging for children whose feet and gait characteristics are rapidly changing as their bodies grow. This project aims to develop new tools that reduce the guesswork when choosing the right shoe to suit healthy development of a child’s foot. ",
      image: shoesImg
    },
    { id: 2,
        title: "The perfect school chair - A study of school chairs and how they can be improved",
        author: "Dr Hans Gray, Research Fellow",
        summary: "Well-designed chairs foster good posture, improve comfort, reduce fatigue, and help reduce or prevent back pain and are believed to have long-term health benefits. Designing good chairs for a school setting is more challenging than designing chairs for adults because of the larger variation in anthropometric measurements (sizes of the segments of the human body) and stricter budgetary constraints. The group of students who take on this project are expected to study the chairs in their own school to evaluate if they are fit for purpose based on the anthropometric measurements of the students who use them. The students will then come up with their own design for “The perfect school chair”. \n" +
            "\n" +
            "This project will expose students to concepts in sampling, collecting data, anthropometry, ergonomics, design, and computer aided design (CAD).",
        image: chairImg
    },
    { id: 3,
        title: "Fabrication of tissue -engineered blood vessels",
        author: "Hazem Alkazemi (PhD Student)",
        summary: "Development of a method to fabricate biodegradable and biocompatible vascular grafts to replace damaged blood vessels.",
        image: vesselImg
    },
    { id: 4,
        title: "Back Massage",
        author: "",
        summary: "",
        image: backImg
    },
    { id: 5,
        title: "Ideal shoulder muscle rehabilitation program after total shoulder arthroplasty",
        author: "Yichen Yu (PhD student)",
        summary: "Total shoulder arthroplasty is a shoulder replacement surgery in which the damaged parts of the shoulder are replaced with artificial implant components. The most common indication for total shoulder arthroplasty is pain that is not cured by conservative treatment or a severe fracture. Although total shoulder arthroplasty has been successful in relieving pain and improving shoulder function, it usually results in reduced shoulder range of motion and therefore limits the choice of shoulder exercises for rehabilitation. The objective of this project is to evaluate currently available shoulder exercises and come up with an ideal shoulder muscle rehabilitation program for a shoulder after total shoulder arthroplasty.",
        image: shoulderImg
    },
    { id: 6,
        title: "Redesigning osseointegrated implants for accelerated osseointegration",
        author: "Ryan Tiew (PhD student)",
        summary: "Osseointegrated implant for transfemoral amputees is a relatively area of study in the field of implant and orthopedics. Multiple implant designs are present in the market but most still require long recovery times and extensive rehabilitation programs. The purpose of the project is to come up with novel ways of reducing this recovery time either through mechanical redesign or using materials that better promote osseointegration.",
        image: implantsImg
    },
    { id: 7,
        title: "Sustainable skiing",
        author: "Dan Hopkins (PhD student)",
        summary: "With the progression of global warming many skiing regions face the prospects of reduced snowfall and shorter winters. To compensate for this, resorts have turned to artificial snow making which is energy and water intensive. However, even artificial snow making is useless if it’s too warm in the first place. This project aims to investigate how using alternative methods or materials to snow and/or modifying ski equipment could reduce the environmental impact of the ski industry and allow future generations to enjoy the experience of skiing.",
        image: skiingImg
    },
    { id: 8,
        title: "Design of an inertial motion capture suit",
        author: "Zhou (Alex) Fang (PhD student)",
        summary: "Human motion capture (mocap) has a wide range of applications including medical rehabilitation, sports training, orthopaedics and film and animation. Optoelectronics systems are the traditional mocap solution to measure human motion – this system relies on high-speed cameras detecting the positions of retro-reflective markers placed on the body. Unfortunately, these systems are expensive, require considerable technical expertise for operation, and are typically confined to the laboratory environment. In recent years, wearable sensors called inertial measurement units (IMUs) have gained popularity. IMUs are wireless, lightweight sensors capable of calculating the orientations of the segments that it is mounted on. With a textile suit that contains an IMU on each segment of the user, known as the inertial mocap suit, the joint kinematics of the body may be captured and monitored in real time. Existing products such as the Rokoko Smartsuit Pro (Rokoko, Copenhagen, Denmark) have enabled animation production and filmmaking for independent creators. However, the IMUs employed are integrated over one suit that covers the whole body, and may have redundant sensors for users that only require motion capture of an individual limb or segment. A feature that allows the mocap suit to be assembled and disassembled for different body segments would be useful.\n" +
            "\n" +
            "In this project, a student team will design an inertial motion capture suit that (allow assemble and disassemble for different body segments), be comfortable and provide low-cost motion measurement for use in clinical applications, research, and sports.",
        image: suitImg
    },
    { id: 9,
        title: "Stem cell transplantation as a progressing treatment for retinitis pigmentosa",
        author: "Chiao-Hwee Lee (PhD student)",
        summary: "Retinitis Pigmentosa (RP) is a group of retinal dystrophies caused by progressive apoptosis of rods and cones present in photoreceptors. It is the most common type of retinal degeneration with approximately 2.5 million people affected worldwide. There are currently about 70 genes found to be involved with RP, making treatment extremely problematic due to the diversity of genetic pathophysiology. Attempts using pharmacologic drugs, gene therapy, cell transplantation and retinal implants have been researched heavily. Pharmacology drugs have shown to have contrasting reports, leading to inconclusive results. Several clinical trials of gene therapy have been conducted the past few years, leading to FDA approval for voretigene neparvovec (LUXTURNA) as treatment for RP. Research on cell transplantation has been promising but the long-term effectiveness and risks remain unknown. Presently, there are two retinal implants (Argus II and Alpha IMS) developed for RP treatment but the safety and efficacy of the implants require further research. Despite significant progress made for RP treatment the past 5 years, there is still no cure for RP. Difficulties in maintaining the effectiveness of the treatments beyond 5 years have been a great hindrance for many emerging research treatments. Therefore, vitamin therapy is often recommended to prevent the progression of vision loss. Nevertheless, advances in technologies and the understanding of RP pathophysiology continue to provide hope of vision for patients.",
        image: stemImg
    },
    { id: 10,
        title: "3D bioprinting microbes for the production of therapeutics",
        author: "Matt Mail (PhD student)",
        summary: "3D bioprinting is a production method used to create complex 3D structures containing a mixture of materials and living cells. Nearly all research in this field has focused on using human cells to develop tissue and organ analogues. However, therapeutic agents (such as insulin) have long been produced through well-studied microbes; typically modified bacteria and yeasts. Using 3D bioprinting it should be possible to create structures containing microbes that can emit therapeutics directly to the body, be reused in traditional stirred tank reactors, and enable continuous production of therapeutics in a plug flow reactor.",
        image: microbesImg
    },
    { id: 11,
        title: "3D printing of a stent-antenna",
        author: "Franklin Tai (PhD student)",
        summary: "A stent with wireless sensors is an emerging research area. This project aims to create a low-cost prototype of a stent-antenna using 3D printing techniques and polymer materials. Students will go through design processes to meet the mechanical requirement as well as printing feasibility. ",
        image: stentAntennaImg
    },
    { id: 12,
        title: "How does the brain navigate?",
        author: "Dr Yanbo (Liam) Lian (Research Fellow)",
        summary: "Human beings rely on navigational abilities in daily life: they know where they are (localisation) and where to go towards a destination (route-planning). This ability is impossible without a complex brain that processes information from various sensory systems such as visual system, auditory system, and many others. In this project, we will be exploring how different sensory systems might affect our ability to navigate.",
        image: brainImg
    },
];

export default function ProjectList() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [isFullscreenMode, setIsFullscreenMode] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const sectionRef = useRef<HTMLDivElement>(null);
    const inView = useInView(sectionRef, { once: true, margin: "-10% 0px" });

    const handleNext = () => { if (activeIndex !== null && activeIndex < projects.length - 1) setActiveIndex(activeIndex + 1); };
    const handlePrev = () => { if (activeIndex !== null && activeIndex > 0) setActiveIndex(activeIndex - 1); };

    const enterFullscreen = () => {
        setIsFullscreenMode(true);
        if (containerRef.current) {
            if (containerRef.current.requestFullscreen) containerRef.current.requestFullscreen();
            else if ((containerRef.current as any).webkitRequestFullscreen) (containerRef.current as any).webkitRequestFullscreen();
            else if ((containerRef.current as any).msRequestFullscreen) (containerRef.current as any).msRequestFullscreen();
        }
    };

    const exitFullscreenMode = () => {
        setIsFullscreenMode(false);
        if (document.exitFullscreen) document.exitFullscreen();
        else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
        else if ((document as any).msExitFullscreen) (document as any).msExitFullscreen();
    };

    useEffect(() => {
        const handleFullScreenChange = () => {
            if (!document.fullscreenElement && !(document as any).webkitFullscreenElement && !(document as any).msFullscreenElement) {
                setIsFullscreenMode(false);
            }
        };
        document.addEventListener("fullscreenchange", handleFullScreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
        document.addEventListener("msfullscreenchange", handleFullScreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullScreenChange);
            document.removeEventListener("webkitfullscreenchange", handleFullScreenChange);
            document.removeEventListener("msfullscreenchange", handleFullScreenChange);
        };
    }, []);

    return (
        <div className="page-container" ref={sectionRef}>
            <div className="content-container">
                <motion.header 
                    className="project-header"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : -30 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <motion.span 
                        className="pill"
                        whileHover={{
                            scale: 1.05,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            transition: { duration: 0.3 }
                        }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Editable 
                            id="projectlist.pill" 
                            defaultText="Project List"
                            satelliteType="victoria"
                        />
                    </motion.span>
                    <motion.h2 
                        className="title hover-gradient-text"
                        whileHover={{
                            scale: 1.02,
                            transition: { duration: 0.3 }
                        }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Editable 
                            id="projectlist.title" 
                            defaultText="2025 PROJECT LIST"
                            satelliteType="victoria"
                        />
                    </motion.h2>
                    <motion.p 
                        className="subtitle"
                        whileHover={{
                            scale: 1.01,
                            transition: { duration: 0.3 }
                        }}
                    >
                        <Editable 
                            id="projectlist.subtitle" 
                            defaultText="Click on each project to find out more"
                            satelliteType="victoria"
                        />
                    </motion.p>
                </motion.header>

                <div className="grid">
                    {projects.map((p, i) => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ 
                                opacity: inView ? 1 : 0, 
                                y: inView ? 0 : 50, 
                                scale: inView ? 1 : 0.9 
                            }}
                            transition={{ 
                                duration: 0.6, 
                                delay: inView ? i * 0.1 : 0, 
                                ease: "easeOut" 
                            }}
                            whileHover={{ scale: 1.05, y: -6 }}
                            whileTap={{ scale: 0.95 }}
                            className="card"
                            onClick={() => setActiveIndex(i)}
                        >
                            <img src={p.image} alt={p.title} className="card-image" />
                            <div className="card-text">
                                <h3 className="card-title">{p.title}</h3>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {activeIndex !== null && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => {
                            setActiveIndex(null);
                            setIsFullscreenMode(false);
                        }}
                    >
                        <motion.div
                            ref={containerRef}
                            className={`modal-container ${isFullscreenMode ? "fullscreen" : ""}`}
                            initial={{ scale: 0.9, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 50 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <motion.div 
                                className="image-wrapper"
                                key={activeIndex}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                            >
                                <img
                                    src={projects[activeIndex].image}
                                    alt={projects[activeIndex].title}
                                />
                            </motion.div>

                            {!isFullscreenMode && (
                                <>
                                    <motion.div 
                                        className="text-container"
                                        key={`text-${activeIndex}`}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -30 }}
                                        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                                    >
                                        <h3 className="modal-title">{projects[activeIndex].title}</h3>
                                        <p className="modal-author">Mentor: {projects[activeIndex].author}</p>
                                        <p className="modal-summary">Introduction: {projects[activeIndex].summary}</p>
                                    </motion.div>

                                    <button className="fullscreen-button" onClick={enterFullscreen}>⛶</button>
                                </>
                            )}

                            {activeIndex > 0 && (
                                <motion.button 
                                    className="nav-button prev" 
                                    onClick={handlePrev}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    whileHover={{ scale: 1.1, x: -5 }}
                                    whileTap={{ scale: 0.9 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                    ◀
                                </motion.button>
                            )}
                            {activeIndex < projects.length - 1 && (
                                <motion.button 
                                    className="nav-button next" 
                                    onClick={handleNext}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    whileHover={{ scale: 1.1, x: 5 }}
                                    whileTap={{ scale: 0.9 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                    ▶
                                </motion.button>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .page-container {
                    width: 100%;
                    padding: 64px 0;
                    background: transparent;
                }
                
                .project-header {
                    text-align: center;
                    margin-bottom: 3rem;
                }

                .content-container {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .title {
                    font-size: clamp(32px, 4.6vw, 64px);
                    font-weight: 800;
                    line-height: 1.2;
                    color: #017151;
                    margin-bottom: 12px;
                    margin-top: 12px;
                }
                
                /* 悬停渐变色动画 */
                .hover-gradient-text {
                    background-size: 200% 200%;
                    transition: background-position 0.6s ease;
                }
                .hover-gradient-text:hover {
                    background: linear-gradient(45deg, #A7DEA0, #017151, #5EA99E, #A7DEA0);
                    background-size: 300% 300%;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: gradientShift 2s ease infinite;
                }
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                .subtitle {
                    font-size: 1.125rem;
                    font-weight: 600;
                    margin-bottom: 3rem;
                    color: #174243;
                }

                .grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 24px;
                }

                .card {
                    cursor: pointer;
                    border-radius: 16px;
                    overflow: hidden;
                    background: rgba(255, 255, 255, 0.3);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    transition: transform 0.3s ease;
                }

                .card:hover {
                    transform: translateY(-6px) scale(1.05);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
                }

                .card:active {
                    transform: translateY(-3px) scale(1.02);
                }

                .card-image {
                    width: 100%;
                    height: 200px;
                    object-fit: cover;
                }

                .card-text {
                    padding: 12px;
                }

                .card-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #174243;
                }

                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.7);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 50;
                }

                .modal-container {
                    position: relative;
                    width: 100%;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    border-radius: 16px;
                    background: #fff;
                    max-width: 1000px;
                    max-height: 900px;
                    
                }

                .modal-container.fullscreen {
                    border-radius: 0;
                    background: black;
                    max-width: 100%;
                    max-height: 100%;
                    height: 100%;
                    flex-direction: row;
                }

                .image-wrapper {
                    flex: 1;
                    background: #000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden; /* 裁剪超出部分 */
                }
                
                .image-wrapper img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover; /* 关键：保持比例同时填满容器 */
                    object-position: center center; /* 居中显示 */
                }


                .text-container {                
                    padding: 24px;
                    color: #174243;
                    overflow-y: auto;
                }

                .modal-title {
                    font-size: 22px;
                    font-weight: bold;
                }

                .modal-author {
                    font-size: 14px;
                    color: #666;
                    margin-top: 4px;
                }

                .modal-summary {
                    font-size: 14px;
                    margin-top: 14px;
                    line-height: 1.4;
                }

                .fullscreen-button {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    background: rgba(0,0,0,0.6);
                    border-radius: 50%;
                    padding: 8px;
                    color: white;
                    font-size: 18px;
                }

                .nav-button {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    border-radius: 50%;
                    padding: 12px;
                    font-size: 18px;
                    z-index: 60;
                }

                .nav-button.prev {
                    left: 16px;
                }

                .nav-button.next {
                    right: 16px;
                }

                .modal-container.fullscreen .nav-button {
                    background: rgba(0,0,0,0.5);
                    color: #fff;
                }

                .modal-container:not(.fullscreen) .nav-button {
                    background: #fff;
                    color: #000;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                }
            `}</style>
        </div>
    );
}
