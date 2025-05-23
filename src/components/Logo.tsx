import LogoIcon from '@/components/LogoIcon';
import LogoText from './LogoText';
export default function Logo({ }: {
    iconSize?: number,
    textWidth?: number,
    textHeight?: number
}) {
    return (
        <div className="flex items-center justify-center w-full gap-2 transition-all duration-300 ease-in-out hover:gap-6 group">
            <LogoIcon className={`w-12 h-12 flex items-center justify-center text-black animate-spin-slow group-hover:scale-110 transition-all duration-300`} />
            <LogoText className={`flex items-center justify-center w-18 md:w-36 h-fit text-black group-hover:scale-110 transition-all duration-300`} />
        </div>
    );
}
