import JSZip from "jszip";
import { saveAs } from "file-saver";

interface GenerationData {
  prompt: string;
  result: string | null;
  created_at: string;
}

export async function exportProjectAsZip(projectName: string, generations: GenerationData[]) {
  const zip = new JSZip();
  const src = zip.folder("src");

  generations.forEach((gen, i) => {
    if (!gen.result) return;
    const filename = `generation_${i + 1}.txt`;
    const content = `// Prompt: ${gen.prompt}\n// Generated: ${new Date(gen.created_at).toLocaleString("ru")}\n\n${gen.result}`;
    src?.file(filename, content);
  });

  // Add a README
  const readme = `# ${projectName}\n\nСгенерировано с помощью Lurk Dev\nhttps://lurk-dev.lovable.app\n\nГенераций: ${generations.filter(g => g.result).length}\n`;
  zip.file("README.md", readme);

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `${projectName.replace(/\s+/g, "_").toLowerCase()}.zip`);
}
