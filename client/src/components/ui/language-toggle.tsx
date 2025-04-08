import React from "react";
import { useLanguage } from "@/hooks/use-language";
import { Switch } from "@/components/ui/switch";

export default function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  const handleToggleChange = (checked: boolean) => {
    setLanguage(checked ? 'es' : 'en');
  };

  return (
    <div className="flex items-center">
      <div className="flex items-center space-x-1">
        <span className={`text-xs ${language === 'en' ? 'font-medium text-primary' : 'text-gray-500'}`}>
          {t('english')}
        </span>
        <Switch
          id="language-toggle"
          checked={language === 'es'}
          onCheckedChange={handleToggleChange}
          className="mx-1"
        />
        <span className={`text-xs ${language === 'es' ? 'font-medium text-primary' : 'text-gray-500'}`}>
          {t('spanish')}
        </span>
      </div>
    </div>
  );
}