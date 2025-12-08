/**
 * Certificate Template Registry
 * 
 * To add a new template:
 * 1. Create a new TemplateX.tsx file in this directory
 * 2. Import it here
 * 3. Add it to the templateRegistry array
 * 
 * No other code changes needed!
 */

import { Template1 } from "./Template1";
import { TemplateMetadata } from "./types";

export const templateRegistry: TemplateMetadata[] = [
    {
        id: "template-1",
        name: "Standard Certificate",
        description: "Official certificate template with institutional headers",
        thumbnailPath: "/src/assets/certificate-templates/template-1.png",
        component: Template1
    }
    // Add new templates here:
    // {
    //   id: "template-2",
    //   name: "Modern Certificate",
    //   description: "Contemporary design with bold colors",
    //   thumbnailPath: "/src/assets/certificate-templates/template-2.png",
    //   component: Template2
    // }
];

/**
 * Get template component by ID
 */
export function getTemplateById(templateId: string) {
    return templateRegistry.find(t => t.id === templateId);
}

/**
 * Get all available templates
 */
export function getAllTemplates() {
    return templateRegistry;
}

// Export template components
export { Template1 };
export type { CertificateTemplateProps, CertificateData, TemplateMetadata } from "./types";
