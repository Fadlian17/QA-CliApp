# PowerShell script to change file permissions using icacls

# Define the file path and the permissions you want to set
$filePath = "D:\Automation\cli-api-automation\cli-api.js"
$permissions = "Users:(R,W)"  # Example: Read and Write permissions for Users

# Use icacls to set the permissions
icacls $filePath /grant $permissions

# Output the result
Write-Host "Permissions for $filePath have been updated."
