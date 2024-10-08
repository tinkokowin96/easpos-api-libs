type BrokerRequest = ({ cache: true; key: keyof AppCache } | { cache: false }) & {
   action: (meta?: Metadata) => Promise<any> | any;
   app?: EApp;
};
