import React from "react";
import { useLanguage } from "@/hooks/use-language";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Globe } from "lucide-react";

export default function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  const handleToggleChange = (checked: boolean) => {
    setLanguage(checked ? 'es' : 'en');
  };

  return (
    <div className="flex items-center space-x-2">
      <Globe className="w-4 h-4 text-gray-500" />
      <Label htmlFor="language-toggle" className="text-xs text-gray-600">
        {t('language')}:
      </Label>
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