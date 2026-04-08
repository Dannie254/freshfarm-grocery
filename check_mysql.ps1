# Check MySQL service
$mysqlService = Get-Service | Where-Object { $_.Name -like '*mysql*' -or $_.Name -like '*mariadb*' }
if ($mysqlService) {
    Write-Host "MySQL Service found:"
    $mysqlService | Format-Table Name, Status -AutoSize
} else {
    Write-Host "No MySQL/MariaDB service found on this system"
}

# Try to find mysql executable
$mysqlPath = Get-Command mysql -ErrorAction SilentlyContinue
if ($mysqlPath) {
    Write-Host "MySQL command found at: $($mysqlPath.Source)"
} else {
    Write-Host "MySQL command not found in PATH"
}
