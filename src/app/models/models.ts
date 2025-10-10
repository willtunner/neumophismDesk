export interface Company {
    id: string;
    name: string;
    keywords: string[];
    created: string;
    updated: string | null; 
    cnpj: string;
    city: string;
    state: string;
    address: string;
    zipcode: string;
    phone: string;
    connectionServ: string;
    email: string;
    versionServ: string | null;
    clients: User[];
    helpDeskCompanyId?: string;
  }

  export interface Call {
     id: string;
     deleted: boolean;
     created: Date;
     updated: Date;
     companyId: string;
     company: Company | null;
     clientId: string;
     client: User | null;
     title: string;
     description: string;
     resolution: string;
     tags: string[];
     connection: string;
     closed: boolean;
     finalized: Date;
     operatorId: string;
     operator: User | null;
     helpDeskCompanyId?: string;
  }

  export interface HelpDeskCompany {
    id: string;
    name: string;
    keywords: string[]; // Lista de palavras-chave para busca, salvar o nome da empresa em palavra-chave em minusculo
    created: Date; // timestamp formato do firebase (1 de julho de 2025 às 11:35:36 UTC-3), salvar no formato Date e criar um pipe para exibir a data no formato "01/07/2025 - 11:35:36" 
    updated: Date; // timestamp formato do firebase (1 de julho de 2025 às 11:35:36 UTC-3), salvar no formato Date e criar um pipe para exibir a data no formato "01/07/2025 - 11:35:36" 
    cnpj: number;
    city: string;
    state: string;
    address: string;
    neighborhood: string;
    zipcode: number;
    phone: number;
    email: string;
    companies: Company[];
    employees: User[];
    roles: string[];
    password?: string;
    active: boolean;
  }

  export interface User {
    id: string;
    deleted: boolean;
    created: Date;
    updated?: Date | null;
    username: string;
    name: string;
    phone: string;
    email: string;
    password: string;
    isLoggedIn: boolean;
    imageUrl: string;
    roles: string[];
    connection?: string | null;
    helpDeskCompanyId?: string;
    helpDeskCompany?: HelpDeskCompany | null;
    companyId?: string;
    company?: Company | null;
  }


  export interface ChatRoom {
    id: string;
    close: boolean;
    created: Date;
    updated?: Date | null;
    operator: User;
    client: User;
    mensages: Message[],
    unreadCount?: number;
    occurrence: string;
  }

  export interface userChatLogged {
    user: User;
    occurrency?: string;
    date: any;
  }

  export interface Message {
    sender: string;        
    content: string;       
    timestamp: Date;       
    imageUrl: string;
    uploadImg?: string;    
    isRead?: boolean;  
  }

  export interface DropDownVideos {
    id?: string;
    dropdownText: string;
    videos: Video[];
  }
  
  export interface Video {
    id?: string;
    url: string;
    title: string;
    created: Date;
    imgProfile?: string;
    nameProfile: string;
    sector: string;
  }

  export interface VersionSistem {
    id?: string;
    version: string;
    overviewText: string;
    summaryList: Sumary[];
    newChangesReview: string;
    aprovedBy: string[];
    create: Date;
  }

  export interface Sumary {
    id?:  string;
    userId: string;
    title: string;
    description: string;
    author: string;
    create: Date;
    developer: string;
    comments?: CommentsVersion[];
    close: boolean;
    images?: string[];
  }

  export interface CommentsVersion {
    userId: string;
    comment: string;
    create: Date;
  }

  export interface SimplifiedCall {
    callId: string;
    date: string;
    companyId: string;
    companyName: string;
  }

  export interface ChartData {
    name: string;
    y: number;
    color?: string;
  }

