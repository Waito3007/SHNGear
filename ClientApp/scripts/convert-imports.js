#!/usr/bin/env node

/**
 * Script để chuyển đổi relative imports thành alias imports
 * Sử dụng: node convert-imports.js [file-path]
 */

const fs = require("fs");
const path = require("path");

// Mapping của các alias
const ALIAS_MAPPINGS = {
  components: "@/components",
  pages: "@/pages",
  utils: "@/utils",
  services: "@/services",
  assets: "@/assets",
  contexts: "@/contexts",
  hook: "@/hooks",
  config: "@/config",
};

function convertImports(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`File không tồn tại: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");
  const originalContent = content;

  // Regex để tìm các import statements
  const importRegex = /import\s+(?:[\w\s{},*]+\s+from\s+)?['"]([^'"]+)['"]/g;

  content = content.replace(importRegex, (match, importPath) => {
    // Bỏ qua nếu không phải relative import
    if (!importPath.startsWith(".")) {
      return match;
    }

    // Chuyển đổi relative path thành absolute path
    const currentDir = path.dirname(filePath);
    const resolvedPath = path.resolve(currentDir, importPath);
    const srcDir = path.resolve(
      path.dirname(filePath),
      "../".repeat(importPath.split("../").length - 1)
    );

    // Tính relative path từ src directory
    let relativePath = path.relative(srcDir, resolvedPath);

    // Chuẩn hóa path separators cho Windows
    relativePath = relativePath.replace(/\\/g, "/");

    // Tìm alias phù hợp
    for (const [folder, alias] of Object.entries(ALIAS_MAPPINGS)) {
      if (relativePath.startsWith(folder + "/") || relativePath === folder) {
        const newPath = relativePath.replace(new RegExp(`^${folder}`), alias);
        return match.replace(importPath, newPath);
      }
    }

    // Nếu không tìm thấy alias phù hợp, sử dụng @ root
    if (!relativePath.startsWith("@")) {
      const newPath = "@/" + relativePath;
      return match.replace(importPath, newPath);
    }

    return match;
  });

  // Chỉ ghi file nếu có thay đổi
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✅ Đã cập nhật: ${filePath}`);
  } else {
    console.log(`⏭️  Không có thay đổi: ${filePath}`);
  }
}

function convertDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.error(`Thư mục không tồn tại: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (
      stat.isDirectory() &&
      !file.startsWith(".") &&
      file !== "node_modules"
    ) {
      convertDirectory(fullPath);
    } else if (
      stat.isFile() &&
      (file.endsWith(".js") ||
        file.endsWith(".jsx") ||
        file.endsWith(".ts") ||
        file.endsWith(".tsx"))
    ) {
      convertImports(fullPath);
    }
  });
}

// Main execution
const targetPath = process.argv[2];

if (!targetPath) {
  console.log(
    "Sử dụng: node convert-imports.js [file-path hoặc directory-path]"
  );
  process.exit(1);
}

const resolvedPath = path.resolve(targetPath);

if (fs.statSync(resolvedPath).isDirectory()) {
  console.log(`🔄 Chuyển đổi tất cả files trong thư mục: ${resolvedPath}`);
  convertDirectory(resolvedPath);
} else {
  console.log(`🔄 Chuyển đổi file: ${resolvedPath}`);
  convertImports(resolvedPath);
}

console.log("✨ Hoàn thành!");
