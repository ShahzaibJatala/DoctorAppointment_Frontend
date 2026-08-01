import PatientFooter from "@/components/layouts/PatientFooter";
import Header from "@/components/layouts/header";
import { PropsWithChildren } from "react";


export default function RootLayout({children} : PropsWithChildren) {
    return (
    <>
        {/* <header><Header /></header> */}
         {children}
        <PatientFooter />
        
    </>
    )
}