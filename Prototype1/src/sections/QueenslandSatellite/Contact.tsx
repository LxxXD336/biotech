import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Editable, useImageOverride } from "../../components/SatelliteAdminPanel";
import JBlogo from "../../QueenslandSatelliteResource/JBlogo.png";
import QUTlogo from "../../QueenslandSatelliteResource/QUTlogo.png";

export default function Contact() {
    const sectionRef = useRef<HTMLDivElement | null>(null);
    const inView = useInView(sectionRef, { once: true, margin: "-10% 0px" });
    const getImageOverride = useImageOverride("queensland");
    const logo1 = getImageOverride("logo1", JBlogo);
    const logo2 = getImageOverride("logo2", QUTlogo);

    return (
        <motion.div 
            className="contact-container"
            ref={sectionRef}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            <motion.div 
                className="contact-card"
                whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
                    transition: { duration: 0.3 }
                }}
            >
                        <motion.h2 
                            className="contact-title hover-gradient-text"
                            whileHover={{ 
                                scale: 1.05,
                                transition: { duration: 0.3 }
                            }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Editable 
                                id="contact.title" 
                                defaultText="CONTACT"
                                satelliteType="queensland"
                            />
                        </motion.h2>
                
                <motion.p 
                    className="contact-subtitle"
                    whileHover={{ 
                        scale: 1.02,
                        transition: { duration: 0.3 }
                    }}
                >
                    <Editable 
                        id="contact.subtitle" 
                        defaultText="We'd love to hear from you"
                        satelliteType="queensland"
                    />
                </motion.p>
                
                <motion.p 
                    className="contact-text"
                    whileHover={{ 
                        scale: 1.01,
                        transition: { duration: 0.3 }
                    }}
                >
                    <Editable 
                        id="contact.text" 
                        defaultText="We're happy to answer all your questions about the Queensland BIOTech Futures Challenge. Before you get in contact make sure to check out our FAQ's."
                        satelliteType="queensland"
                    />
                </motion.p>

                <motion.div 
                    className="contact-email"
                    whileHover={{ 
                        scale: 1.05,
                        transition: { duration: 0.3 }
                    }}
                >
                    <motion.a
                        href="mailto:contact@jointbiomechanics.org"
                        className="email-button"
                        whileHover={{ 
                            scale: 1.1,
                            boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                            transition: { duration: 0.3 }
                        }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Editable 
                            id="contact.email" 
                            defaultText="✉️ contact@jointbiomechanics.org"
                            satelliteType="queensland"
                        />
                    </motion.a>
                </motion.div>

                <motion.div 
                    className="logos"
                    whileHover={{ 
                        scale: 1.05,
                        transition: { duration: 0.3 }
                    }}
                >
                    <motion.img 
                        src={logo1} 
                        alt="Joint Biomechanics Logo" 
                        className="logo logo-jb"
                        whileHover={{ 
                            scale: 1.1,
                            rotate: 5,
                            transition: { duration: 0.3 }
                        }}
                        whileTap={{ scale: 0.95 }}
                    />
                    <motion.img 
                        src={logo2} 
                        alt="QUT Logo" 
                        className="logo logo-qut"
                        whileHover={{ 
                            scale: 1.1,
                            rotate: -5,
                            transition: { duration: 0.3 }
                        }}
                        whileTap={{ scale: 0.95 }}
                    />
                </motion.div>
            </motion.div>

            <style>{`
                .contact-container {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    background: transparent;
                    padding: 40px 20px;
                    margin-top: 0px;
                }

                .contact-card {
                    padding: 40px 30px;
                    border-radius: 16px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
                    max-width: 800px;
                    width: 100%;
                    text-align: center;
                    background: rgba(255, 255, 255, 1);
                }

            .contact-title {
              font-size: 2rem;
              font-weight: bold;
              color: #222;
              margin-bottom: 20px;
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

                .contact-subtitle {
                    font-size: 1.2rem;
                    color: #555;
                    margin-bottom: 20px;
                }

                .contact-text {
                    font-size: 1rem;
                    color: #333;
                    margin-bottom: 25px;
                    line-height: 1.6;
                }

                .faq-link {
                    color: #A7DEA0;
                    text-decoration: none;
                    font-weight: bold;
                }

                .contact-email {
                    margin-bottom: 30px;
                }

                .email-button {
                    display: inline-block;
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #A7DEA0, #8BC34A);
                    color: white;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: bold;
                    transition: all 0.3s ease;
                }

                .logos {
                    display: flex;
                    justify-content: center;
                    gap: 30px;
                    align-items: center;
                }

                .logo {
                    transition: transform 0.3s ease;
                    max-width: 100%;
                }

                /* 针对不同Logo的特定尺寸 */
                .logo-jb {
                    max-height: 60px;
                    max-width: 120px;
                    width: auto;
                }

                .logo-qut {
                    max-height: 100px;
                    max-width: 150px;
                    width: auto;
                }

                @media (max-width: 768px) {
                    .contact-card {
                        padding: 30px 20px;
                    }

                    .contact-title {
                        font-size: 1.5rem;
                    }

                    .contact-subtitle {
                        font-size: 1rem;
                    }

                    .logos {
                        gap: 20px;
                    }

                    .logo-jb {
                        max-height: 65px;
                    }

                    .logo-qut {
                        max-height: 80px;
                    }
                }
            `}</style>
        </motion.div>
    );
};

