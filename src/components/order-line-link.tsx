"use client";

import { ORDER_LINE_EVENT, type OrderLine } from "@/lib/site";

type OrderLineLinkProps = {
  line: OrderLine;
  className?: string;
  children: React.ReactNode;
};

export function OrderLineLink({ line, className, children }: OrderLineLinkProps) {
  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    const url = new URL(window.location.href);
    url.searchParams.set("linha", line);
    url.hash = "pedido";
    window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
    window.dispatchEvent(new CustomEvent(ORDER_LINE_EVENT, { detail: line }));
    document.getElementById("pedido")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <a href={`/?linha=${line}#pedido`} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
