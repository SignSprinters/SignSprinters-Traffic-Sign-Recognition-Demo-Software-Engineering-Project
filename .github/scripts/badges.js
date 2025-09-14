const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const achievements = {
  'traffic-pioneer': { name: 'Traffic Pioneer', icon: '🚦', color: 'FF6B35', desc: 'First commit' },
  'python-driver': { name: 'Python Driver', icon: '🐍', color: '3776AB', desc: '5+ Python files' },
  'ml-engineer': { name: 'ML Engineer', icon: '🤖', color: 'FF4081', desc: 'ML model files' },
  'data-scientist': { name: 'Data Scientist', icon: '📊', color: '2196F3', desc: 'Dataset files' },
  'doc-master': { name: 'Doc Master', icon: '📚', color: '4CAF50', desc: '3+ docs' },
  'test-engineer': { name: 'Test Engineer', icon: '🧪', color: 'FF9800', desc: 'Test files' },
  'commit-champion': { name: 'Commit Champion', icon: '🏆', color: 'FFD700', desc: '25+ commits' }
};

function safeExec(command, fallback = '0') {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() || fallback;
  } catch {
    return fallback;
  }
}

function countFiles(patterns) {
  let count = 0;
  try {
    const files = execSync('find . -type f -name "*.py" -o -name "*.md" -o -name "*.json" -o -name "*test*" -o -name "*model*" -o -name "*.csv" 2>/dev/null || true', { encoding: 'utf8' });
    const fileList = files.split('\n').filter(f => f.trim());
    
    patterns.forEach(pattern => {
      count += fileList.filter(file => 
        file.toLowerCase().includes(pattern.toLowerCase())
      ).length;
    });
  } catch (err) {
    console.log('File counting error:', err.message);
  }
  return count;
}

function analyzeRepo() {
  const stats = {
    commits: parseInt(safeExec('git rev-list --count HEAD 2>/dev/null', '0')),
    pythonFiles: countFiles(['.py']),
    mlFiles: countFiles(['model', '.pkl', '.h5', 'train']),
    dataFiles: countFiles(['data', '.csv', 'dataset']),
    docFiles: countFiles(['.md', 'readme', 'doc']),
    testFiles: countFiles(['test'])
  };
  
  console.log('Repository stats:', stats);
  return stats;
}

function checkEarned(stats) {
  const earned = [];
  if (stats.commits >= 1) earned.push('traffic-pioneer');
  if (stats.pythonFiles >= 5) earned.push('python-driver');
  if (stats.mlFiles >= 1) earned.push('ml-engineer');
  if (stats.dataFiles >= 1) earned.push('data-scientist');
  if (stats.docFiles >= 3) earned.push('doc-master');
  if (stats.testFiles >= 1) earned.push('test-engineer');
  if (stats.commits >= 25) earned.push('commit-champion');
  return earned;
}

function generateBadgeSection(earned, stats) {
  let section = '\n## 🏆 SignSprinters Achievements\n\n';
  
  if (earned.length === 0) {
    section += '🚀 *Start coding to earn your first badge!*\n\n';
    return section;
  }
  
  section += '<div align="center">\n\n';
  earned.forEach(key => {
    const ach = achievements[key];
    const badgeUrl = `https://img.shields.io/badge/${encodeURIComponent(ach.name)}-${encodeURIComponent(ach.desc)}-${ach.color}?style=for-the-badge`;
    section += `![${ach.name}](${badgeUrl})\n`;
  });
  section += '\n</div>\n\n';
  
  section += '### 📊 Stats\n\n';
  section += `- 🐍 Python Files: ${stats.pythonFiles}\n`;
  section += `- 🤖 ML Files: ${stats.mlFiles}\n`;
  section += `- 📊 Data Files: ${stats.dataFiles}\n`;
  section += `- 📚 Doc Files: ${stats.docFiles}\n`;
  section += `- 🧪 Test Files: ${stats.testFiles}\n`;
  section += `- 📝 Commits: ${stats.commits}\n`;
  section += `\n**Progress: ${earned.length}/${Object.keys(achievements).length} badges**\n\n`;
  section += `*Updated: ${new Date().toLocaleDateString()}*\n\n`;
  
  return section;
}

function main() {
  try {
    console.log('🚦 Starting SignSprinters badge system...');
    
    const stats = analyzeRepo();
    const earned = checkEarned(stats);
    
    console.log(`🏆 Earned ${earned.length} badges:`, earned);
    
    // Save achievement data
    const data = { earned, stats, updated: new Date().toISOString() };
    fs.mkdirSync('.github', { recursive: true });
    fs.writeFileSync('.github/achievements.json', JSON.stringify(data, null, 2));
    
    // Update README
    let readme = fs.existsSync('README.md') ? 
      fs.readFileSync('README.md', 'utf8') : 
      '# SignSprinters Traffic Sign Recognition\n\nWelcome to our project!\n';
    
    // Remove existing achievements section
    readme = readme.replace(/\n## 🏆 SignSprinters Achievements[\s\S]*?(?=\n## |\n# |$)/g, '');
    
    // Add new section
    readme += generateBadgeSection(earned, stats);
    
    fs.writeFileSync('README.md', readme);
    
    console.log('✅ Badges updated successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
