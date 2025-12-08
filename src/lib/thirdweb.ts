import { createThirdwebClient } from "thirdweb";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { darkTheme } from "thirdweb/react";

// Create Thirdweb client with your client ID
export const thirdwebClient = createThirdwebClient({
    clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
});

// Configure supported wallets
export const wallets = [
    // In-app wallets with social login, email, phone, and passkey support
    inAppWallet({
        auth: {
            options: [
                "google",
                "discord",
                "telegram",
                "farcaster",
                "email",
                "x",
                "passkey",
                "phone",
            ],
        },
    }),
    // External wallet options
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    createWallet("me.rainbow"),
];

// Custom theme matching your website's design (dark with neon green accents)
export const customTheme = darkTheme({
    colors: {
        // Primary button - neon green
        primaryButtonBg: "hsl(158, 100%, 50%)",
        primaryButtonText: "hsl(210, 65%, 11%)",

        // Accent colors - neon green
        accentText: "hsl(158, 100%, 50%)",
        accentButtonBg: "hsl(158, 100%, 50%)",
        accentButtonText: "hsl(210, 65%, 11%)",

        // Modal background - dark blue
        modalBg: "hsl(210, 55%, 13%)",

        // Text colors
        primaryText: "hsl(0, 0%, 100%)",
        secondaryText: "hsl(0, 0%, 70%)",

        // Borders
        borderColor: "hsl(210, 40%, 25%)",
        separatorLine: "hsl(210, 40%, 25%)",

        // Connected button state
        connectedButtonBg: "hsl(210, 50%, 15%)",
        connectedButtonBgHover: "hsl(210, 45%, 20%)",

        // Secondary button
        secondaryButtonBg: "hsl(210, 45%, 20%)",
        secondaryButtonText: "hsl(0, 0%, 100%)",
        secondaryButtonHoverBg: "hsl(210, 40%, 25%)",

        // States
        success: "hsl(158, 100%, 50%)",
        danger: "hsl(0, 84.2%, 60.2%)",
    },
});
