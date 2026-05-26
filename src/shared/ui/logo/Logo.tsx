import { VARIANT_STYLES } from "@shared/model";

export const Logo = () => {
  return (
    <div className="flex items-center gap-2 mr-10 flex-shrink-0">
      <div className={`w-7 h-7 ${VARIANT_STYLES.primary} rounded-full flex items-center justify-center`}>
        <div className="w-4 h-4 border-2 border-white rounded-full border-r-transparent rotate-45" />
      </div>
      <span className="text-[#3B82F6]/90 font-bold text-lg tracking-tight">Ensolution</span>
    </div>
  )
}