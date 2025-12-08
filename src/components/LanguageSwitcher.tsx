import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
    const { i18n, t } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-9 px-0">
                    <Globe className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
                    <span className="sr-only">{t('selectLanguage')}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => changeLanguage('en')}>
                    {t('english')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('hi')}>
                    {t('hindi')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('pa')}>
                    {t('punjabi')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('mr')}>
                    {t('marathi')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('bn')}>
                    {t('bengali')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('kn')}>
                    {t('kannada')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
