import React from "react";
import { Sparkles } from "lucide-react";
import { SearchTemplate } from "@vector-pokeapi/shared-types";
import TemplateChip from "./TemplateChip";
import { useTranslations } from "next-intl";

interface SemanticTemplatesProps {
  templatesByCategory: Record<string, SearchTemplate[]>;
  selectedTemplateId: number | null;
  onTemplateClick: (template: SearchTemplate) => void;
}

export default function SemanticTemplates({ templatesByCategory, selectedTemplateId, onTemplateClick }: SemanticTemplatesProps) {
  const t = useTranslations("SearchPage");

  if (Object.keys(templatesByCategory).length === 0) return null;

  return (
    <div className="space-y-3 pt-2">
      <span className="block text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
        <Sparkles size={10} className="text-cyan-400 animate-pulse" /> {t("semanticExamples")}
      </span>
      <div className="space-y-3">
        {Object.entries(templatesByCategory).map(([category, items]) => (
          <div key={category} className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 w-20 shrink-0">
              {category}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {items.map((template) => (
                <TemplateChip
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplateId === template.id}
                  onClick={() => onTemplateClick(template)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
