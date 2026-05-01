import Footer from "@/components/layouts/footer";
import Header from "@/components/layouts/header";
import { PropsWithChildren } from "react";


export default function RootLayout({children} : PropsWithChildren) {
    return (
    <>
        {/* <header><Header /></header> */}
         {children}
        <footer><Footer /></footer>
        
    </>
    )
}