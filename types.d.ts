type Country = {
    code: string;
    name: {
        en: string;
        ar: string;
    };
    currency: {
        en: string;
        ar: string;
    };
    isActive: boolean;
    flag: string;
};

type Language = {
    code: string;
    name: string;
    direction: 'ltr' | 'rtl';
    isActive: boolean;
};
