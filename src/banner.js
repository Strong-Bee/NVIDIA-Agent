import chalk from "chalk";

export function showBanner() {
  console.log(
    chalk.greenBright(`
  _   _  _   _  ___  ____  ___    _      _    ____  _____  _   _  _____ 
 | \\ | || | | ||_ _||  _ \\|_ _|  / \\    / \\  / ___|| ____|| \\ | ||_   _|
 |  \\| || | | | | | | | | || |  / _ \\  / _ \\| |  _ |  _|  |  \\| |  | |  
 | |\\  || |_| | | | | |_| || | / ___ \\/ ___ \\ |_| || |___ | |\\  |  | |  
 |_| \\_| \\___/ |___||____/|___/_/   \\_\\/   \\_\\____||_____||_| \\_|  |_|  
                                                                        
    `),
  );
  console.log(chalk.gray("  Simulasi & Backtest AI Agent Automation\n"));
}
