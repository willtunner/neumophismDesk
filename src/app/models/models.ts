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
    clientsId: string[];
    clients?: User[];
    helpDeskCompanyId?: string;
  }

  export interface Call {
     id: string;
     deleted: boolean;
     created: Date;
     updated: Date;
     companyId: string;
     company?: Company;
     clientId: string;
     client?: User;
     title: string;
     description: string;
     resolution: string;
     tags: string[];
     connection: string;
     closed: boolean;
     finalizedDate: Date;
     operatorId: string;
     operator?: User;
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
    companiesId: string[];
    companies?: Company[];
    employeesId: string[];
    employees?: User[];
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

  export interface Client {
    id: string;
    deleted: boolean;
    created: Date;
    updated: Date | null;
    username: string;
    name: string;
    phone: string;
    email: string;
    password: string;
    isLoggedIn: boolean;
    imageUrl: string;
    roles: string[];
    connection: string | null;
    companyId: string;
    company?: Company;
  }


  export interface ChatRoom {
    id: string;
    close: boolean;
    created: Date;
    updated?: Date | null;
    operator?: User;
    operatorId: string;
    client?: User;
    clientId: string;
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
    senderId: string;        
    content: string;       
    timestamp: Date;      
    isRead?: boolean;  
  }

  export interface Tutorial {
    id?: string;
    dropdownTitle: string;
    videos: Video[];
  }
  
  export interface Video {
    id?: string;
    youtubeUrl: string;
    videoTitle: string;
    created?: Date;
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

