/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import logo from "../../Images/head_logo.png";
import banner1 from "../../Images/banner1.png";
import banner2 from "../../Images/banner2.png";
import banner3 from "../../Images/banner3.png";
import { useCart } from "../Context/CartContext";
import { useAuth } from "../Additionals/AuthContext";
import Auth from "../Pages/Auth";
import icon1 from "../../icons/1.png";
import icon2 from "../../icons/2.png";
import icon3 from "../../icons/3.png";
import icon4 from "../../icons/4.png";
import icon5 from "../../icons/5.png";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

function Nav({ onSearch }) {

    const { setIsCartOpen, totalItems } = useCart();
    const { user, logout } = useAuth();
    const [currentBanner, setCurrentBanner] = useState(0);
    const [showAuth, setShowAuth] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const banners = [banner1, banner2, banner3];
    const location = useLocation();
    const navigate = useNavigate();
    const hideBanner = location.pathname.startsWith("/admin");
    const isAlimentacion = location.pathname === "/Alimentacion";

    const [searchParams] = useSearchParams();

    const seccionEnUrl = isAlimentacion
        ? searchParams.get("seccion")
        : null;

    const svgUsuario = (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className='navbar-svg-element'>
            <path fillRule="evenodd" clipRule="evenodd" d="M12.0001 1.25C9.37678 1.25 7.25013 3.37665 7.25013 6C7.25013 8.62335 9.37678 10.75 12.0001 10.75C14.6235 10.75 16.7501 8.62335 16.7501 6C16.7501 3.37665 14.6235 1.25 12.0001 1.25ZM8.75013 6C8.75013 4.20507 10.2052 2.75 12.0001 2.75C13.7951 2.75 15.2501 4.20507 15.2501 6C15.2501 7.79493 13.7951 9.25 12.0001 9.25C10.2052 9.25 8.75013 7.79493 8.75013 6Z" fill="#e34f1d" />
            <path fillRule="evenodd" clipRule="evenodd" d="M12.0001 12.25C9.68658 12.25 7.55506 12.7759 5.97558 13.6643C4.41962 14.5396 3.25013 15.8661 3.25013 17.5L3.25007 17.602C3.24894 18.7638 3.24752 20.222 4.52655 21.2635C5.15602 21.7761 6.03661 22.1406 7.22634 22.3815C8.4194 22.6229 9.97436 22.75 12.0001 22.75C14.0259 22.75 15.5809 22.6229 16.7739 22.3815C17.9637 22.1406 18.8443 21.7761 19.4737 21.2635C20.7527 20.222 20.7513 18.7638 20.7502 17.602L20.7501 17.5C20.7501 15.8661 19.5807 14.5396 18.0247 13.6643C16.4452 12.7759 14.3137 12.25 12.0001 12.25ZM4.75013 17.5C4.75013 16.6487 5.37151 15.7251 6.71098 14.9717C8.02693 14.2315 9.89541 13.75 12.0001 13.75C14.1049 13.75 15.9733 14.2315 17.2893 14.9717C18.6288 15.7251 19.2501 16.6487 19.2501 17.5C19.2501 18.8078 19.2098 19.544 18.5265 20.1004C18.156 20.4022 17.5366 20.6967 16.4763 20.9113C15.4194 21.1252 13.9744 21.25 12.0001 21.25C10.0259 21.25 8.58087 21.1252 7.52393 20.9113C6.46366 20.6967 5.84425 20.4022 5.47372 20.1004C4.79045 19.544 4.75013 18.8078 4.75013 17.5Z" fill="#e34f1d" />
        </svg>
    );

    const profileIcons = [icon1, icon2, icon3, icon4, icon5];

    useEffect(() => {
        if (!user) {
            setProfileImage(null);
            return;
        }

        const storageKey = `userProfileImage_${user.id}`;
        let savedImage = sessionStorage.getItem(storageKey);

        if (!savedImage) {
            const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0] % profileIcons.length;
            savedImage = profileIcons[randomIndex];
            sessionStorage.setItem(storageKey, savedImage);
        }

        setProfileImage(savedImage);

    }, [user]);

    const imagenPerfil = (
        <img
            src={profileImage}
            alt="Perfil"
            className='imagenUsuario'
        />
    );

    const goHome = () => { window.location.href = '/'; };

    const handleSeccionNav = (e, seccion) => {
        e.preventDefault();
        navigate(`/Alimentacion?seccion=${seccion}`);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBanner((prev) => (prev + 1) % banners.length);
        }, 7000);
        return () => clearInterval(interval);
    }, [banners.length]);

    const handleBannerChange = (index) => { setCurrentBanner(index); };

    return (
        <>
            <div className="navbar-wrapper">

                <img
                    src={logo}
                    alt="Logo Japanda"
                    className="logo-navbar"
                    onClick={goHome}
                />

                <div className="nav-searchbar">
                    <svg xmlns="http://www.w3.org/2000/svg" className="search-svg" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z"
                            stroke="#757575"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <input
                        type="text"
                        className="input-buscador"
                        placeholder="Buscar producto..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            onSearch(e.target.value.trim());
                        }}
                    />
                </div>

                {user?.rol === "admin" && (
                    <a href="/admin" className="navbar-element-admin">
                        <span className="nav-text">Admin Panel</span>
                    </a>
                )}

                <nav className="navbar">

                    <div className="navbar-item-wrapper">
                        <a href="/Alimentacion" className="navbar-element">
                            <span className="nav-text">
                                Alimentación&nbsp;
                                <svg className="svgFlecha" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path
                                        d="M0.5 3.8501L6.65 10.0001C6.69489 10.0479 6.74911 10.0861 6.80931 10.1121C6.8695 10.1382 6.9344 10.1516 7 10.1516C7.0656 10.1516 7.1305 10.1382 7.19069 10.1121C7.25089 10.0861 7.30511 10.0479 7.35 10.0001L13.5 3.8501"
                                        stroke="currentColor"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </span>
                        </a>

                        <div className="dropdown-menu">
                            {["Snack", "Dulce", "Salado", "Bebidas", "Ramen"].map(seccion => (
                                <a
                                    key={seccion}
                                    href={`/Alimentacion?seccion=${seccion}`}
                                    className={`dropdown-item ${seccionEnUrl === seccion ? "dropdown-item--active" : ""}`}
                                    onClick={(e) => handleSeccionNav(e, seccion)}
                                >
                                    {seccion}
                                </a>
                            ))}
                        </div>
                    </div>

                    <a href="/Decoracion" className="navbar-element">
                        <span className="nav-text">Decoración</span>
                    </a>

                    <a href="/Merchandising" className="navbar-element">
                        <span className="nav-text">Merchandising</span>
                    </a>

                    <a href="/Moda" className="navbar-element">
                        <span className="nav-text">Moda</span>
                    </a>

                    <a href="/Inciensos" className="navbar-element">
                        <span className="nav-text">
                            Inciensos <mark className="tag-new">¡NUEVO!</mark>
                        </span>
                    </a>

                    <div className="navbar-svg-element-wrapper">

                        <div className="side-container">
                            <a href="#" className="navbar-element" onClick={() => setIsCartOpen(true)}>
                                Carrito
                                {totalItems > 0 && (
                                    <span className="nav-cart-count">
                                        {totalItems}
                                    </span>
                                )}
                            </a>
                            <a href="#" className="svg-wrapper" onClick={() => setIsCartOpen(true)}>
                                <svg xmlns="http://www.w3.org/2000/svg" className='navbar-svg-element' viewBox="0 0 24 24">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M2.23737 2.28848C1.84442 2.15749 1.41968 2.36986 1.28869 2.76282C1.15771 3.15578 1.37008 3.58052 1.76303 3.7115L2.02794 3.79981C2.70435 4.02527 3.15155 4.17554 3.481 4.3288C3.79296 4.47392 3.92784 4.59072 4.01426 4.71062C4.10068 4.83052 4.16883 4.99541 4.20785 5.33726C4.24907 5.69826 4.2502 6.17003 4.2502 6.88303L4.2502 9.55487C4.25018 10.9225 4.25017 12.0248 4.36673 12.8917C4.48774 13.7918 4.74664 14.5497 5.34855 15.1516C5.95047 15.7536 6.70834 16.0125 7.60845 16.1335C8.47541 16.25 9.57773 16.25 10.9453 16.25H19.0002C19.4144 16.25 19.7502 15.9142 19.7502 15.5C19.7502 15.0858 19.4144 14.75 19.0002 14.75H11.0002C9.56479 14.75 8.56367 14.7484 7.80832 14.6468C7.07455 14.5482 6.68598 14.3677 6.40921 14.091C6.31252 13.9943 6.22758 13.8839 6.15378 13.75H16.0587C16.507 13.75 16.9014 13.75 17.2288 13.7147C17.5832 13.6764 17.9266 13.5914 18.2497 13.3784C18.5728 13.1653 18.7862 12.8832 18.961 12.5725C19.1224 12.2855 19.2778 11.923 19.4544 11.5109L19.9212 10.4216C20.3057 9.52464 20.6273 8.77419 20.7883 8.16384C20.9563 7.5271 21 6.86229 20.6038 6.26138C20.2076 5.66048 19.5793 5.4388 18.9278 5.34236C18.3034 5.24992 17.4869 5.24995 16.511 5.24999L5.70696 5.24999C5.70421 5.222 5.70129 5.19437 5.69817 5.16711C5.64282 4.68229 5.52222 4.23743 5.23112 3.83355C4.94002 3.42968 4.55613 3.17459 4.1137 2.96876C3.69746 2.77513 3.16814 2.59871 2.54176 2.38994L2.23737 2.28848ZM5.7502 6.74999C5.75021 6.78023 5.75021 6.8107 5.7502 6.84138L5.7502 9.49999C5.7502 10.672 5.75127 11.5544 5.80693 12.25H16.022C16.5179 12.25 16.8305 12.249 17.0678 12.2234C17.287 12.1997 17.3713 12.1608 17.424 12.1261C17.4766 12.0914 17.5455 12.0292 17.6537 11.8371C17.7707 11.629 17.8948 11.3421 18.0901 10.8863L18.5187 9.88631C18.9332 8.91911 19.2087 8.2713 19.3379 7.78124C19.4636 7.30501 19.3999 7.16048 19.3515 7.08712C19.3032 7.01376 19.1954 6.89831 18.7082 6.82619C18.2068 6.75196 17.5029 6.74999 16.4506 6.74999H5.7502Z" fill="#e34f1d" />
                                    <path fillRule="evenodd" clipRule="evenodd" d="M5.2502 19.5C5.2502 20.7426 6.25756 21.75 7.5002 21.75C8.74284 21.75 9.7502 20.7426 9.7502 19.5C9.7502 18.2573 8.74284 17.25 7.5002 17.25C6.25756 17.25 5.2502 18.2573 5.2502 19.5ZM7.5002 20.25C7.08599 20.25 6.7502 19.9142 6.7502 19.5C6.7502 19.0858 7.08599 18.75 7.5002 18.75C7.91442 18.75 8.2502 19.0858 8.2502 19.5C8.2502 19.9142 7.91442 20.25 7.5002 20.25Z" fill="#e34f1d" />
                                    <path fillRule="evenodd" clipRule="evenodd" d="M16.5002 21.7501C15.2576 21.7501 14.2502 20.7427 14.2502 19.5001C14.2502 18.2574 15.2576 17.2501 16.5002 17.2501C17.7428 17.2501 18.7502 18.2574 18.7502 19.5001C18.7502 20.7427 17.7428 21.7501 16.5002 21.7501ZM15.7502 19.5001C15.7502 19.9143 16.086 20.2501 16.5002 20.2501C16.9144 20.2501 17.2502 19.9143 17.2502 19.5001C17.2502 19.0859 16.9144 18.7501 16.5002 18.7501C16.086 18.7501 15.7502 19.0859 15.7502 19.5001Z" fill="#e34f1d" />
                                </svg>
                            </a>
                        </div>

                        <div className="side-container">

                            <a
                                href="#"
                                className="navbar-element"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (!user) return setShowAuth(true);
                                    setShowDropdown(!showDropdown);
                                }}
                            >
                                {user ? user.nombre : "Log in"}
                            </a>

                            <a
                                href="#"
                                className="svg-wrapper"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (!user) return setShowAuth(true);
                                    setShowDropdown(!showDropdown);
                                }}
                            >
                                {user ? imagenPerfil : svgUsuario}
                            </a>

                            {user && (
                                <div className={`user-dropdown ${showDropdown ? "open" : ""}`}>
                                    
                                    <div className="user-dropdown-header">
                                        <span className="user-dropdown-name">{user.nombre}</span>
                                        <span className="user-dropdown-email">{user.email}</span>
                                    </div>

                                    <hr className="user-dropdown-divider" />

                                    <a href="/perfil" className="user-dropdown-item">👤 Mis datos</a>
                                    <a href="/pedidos" className="user-dropdown-item">📦 Mis pedidos</a>
                                    <a href="/Soporte" className="user-dropdown-item">💬 Atención al cliente</a>

                                    <hr className="user-dropdown-divider" />

                                    <button
                                        className="user-dropdown-logout"
                                        onClick={(e) => {
                                            e.preventDefault();

                                            sessionStorage.removeItem(`userProfileImage_${user.id}`);

                                            logout();

                                            window.dispatchEvent(new Event("auth-change"));
                                            window.dispatchEvent(new Event("storage"));

                                            window.location.reload();
                                        }}
                                    >
                                        🚪 Cerrar sesión
                                    </button>

                                </div>
                            )}

                        </div>

                    </div>

                </nav>
            </div>

            {showAuth && <Auth onClose={() => setShowAuth(false)} />}

            {!hideBanner && (
                <div className="banner-carousel">
                    <div
                        className="banner-track"
                        style={{ transform: `translateX(-${currentBanner * 100}%)` }}
                    >
                        {banners.map((banner, index) => (
                            <div className="banner-slide" key={index}>
                                <img src={banner} className="banner-ad" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}

export default Nav;