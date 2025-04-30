# Git Reference Issue Fix

## Problem
The repository was experiencing issues with git pull operations, showing errors like:
```
error: unable to resolve reference refs/remotes/origin/[branch-name]: No such file or directory
```

This is typically caused by corrupt or stale git references in the local repository.

## Solution
The issue was fixed by:

1. Running git garbage collection to clean up unnecessary files:
   ```
   git gc --prune=now
   ```

2. Pruning stale remote-tracking branches:
   ```
   git remote prune origin
   ```

This removed the following stale branches:
- origin/Daniel's-Workspace
- origin/Daniel's-old--Workspace
- origin/Daniel-Tredje-branc

After these steps, git pull operations work correctly again.

## Prevention
To prevent this issue in the future:
- Regularly run `git remote prune origin` to keep remote branch references clean
- Use `git fetch --prune` to automatically prune stale references when fetching
- Avoid creating branch names with special characters or spaces 