import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Image as ImageIcon } from "lucide-react";
import { getAllTemplates } from "@/templates/certificates";

interface TemplateSelectorProps {
  onTemplateSelect: (templateId: string) => void;
  selectedTemplateId: string | null;
}

export function TemplateSelector({ onTemplateSelect, selectedTemplateId }: TemplateSelectorProps) {
  const { t } = useTranslation();
  const [displayedCount, setDisplayedCount] = useState(1);
  const templates = getAllTemplates();

  const handleLoadMore = () => {
    // Load 3 more templates at a time
    setDisplayedCount(prev => Math.min(prev + 3, templates.length));
  };

  const displayedTemplates = templates.slice(0, displayedCount);
  const hasMore = displayedCount < templates.length;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-heading text-lg font-semibold border-b border-accent/20 pb-2">
          {t('selectTemplateTitle')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('selectTemplateDesc')}
        </p>
      </div>

      <div className="space-y-3">
        {displayedTemplates.map((template) => {
          const isSelected = selectedTemplateId === template.id;

          return (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-md ${isSelected
                ? "border-accent bg-accent/5 shadow-md"
                : "border-border/50 bg-card/50 hover:border-accent/50"
                }`}
              onClick={() => onTemplateSelect(template.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Template Thumbnail */}
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-24 bg-secondary/30 rounded border border-border/30 flex items-center justify-center overflow-hidden">
                      <img
                        src={template.thumbnailPath}
                        alt={template.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback if image fails to load
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '<div class="text-muted-foreground"><svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                        }}
                      />
                    </div>
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 bg-accent text-white rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>

                  {/* Template Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                      {isSelected && (
                        <Badge variant="default" className="bg-accent text-white text-xs">
                          {t('selectedBadge')}
                        </Badge>
                      )}
                    </div>

                    {!isSelected && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 text-xs h-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTemplateSelect(template.id);
                        }}
                      >
                        {t('chooseTemplateBtn')}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <Button
          variant="outline"
          className="w-full"
          onClick={handleLoadMore}
        >
          {t('loadMoreTemplates')}
        </Button>
      )}

      {/* Info when all templates are shown */}
      {!hasMore && templates.length > 1 && (
        <p className="text-xs text-center text-muted-foreground">
          {t('allTemplatesDisplayed', { count: templates.length })}
        </p>
      )}
    </div>
  );
}
