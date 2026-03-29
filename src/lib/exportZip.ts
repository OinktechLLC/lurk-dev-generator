import JSZip from "jszip";
import { saveAs } from "file-saver";
import { parseGeneratedProject } from "@/lib/generatedProject";

interface GenerationData {
  prompt: string;
  result: string | null;
  created_at: string;
}

export async function exportProjectAsZip(projectName: string, generations: GenerationData[]) {
  const zip = new JSZip();
  const fallback = zip.folder("notes");

  let filesCount = 0;

  generations.forEach((gen, i) => {
    if (!gen.result) return;

    const parsed = parseGeneratedProject(gen.result);

    if (parsed) {
      parsed.files.forEach((file) => {
        zip.file(file.path, file.content);
        filesCount += 1;
      });
      return;
    }

    const filename = `generation_${i + 1}.txt`;
    const content = `// Prompt: ${gen.prompt}\n// Generated: ${new Date(gen.created_at).toLocaleString("ru")}\n\n${gen.result}`;
    fallback?.file(filename, content);
  });

  const readme = `# ${projectName}\n\nСгенерировано с помощью Lurk Dev\nhttps://lurk-dev.lovable.app\n\nФайлов в архиве: ${filesCount}\nГенераций: ${generations.filter((g) => g.result).length}\n`;
  zip.file("README.md", readme);

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, `${projectName.replace(/\s+/g, "_").toLowerCase()}.zip`);
}
