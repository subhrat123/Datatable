
import { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

import type { DataTableSelectionMultipleChangeEvent } from "primereact/datatable";

import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";

import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

interface Product {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

export default function CheckboxRowSelectionDemo() {
  const apiUrl = import.meta.env.VITE_API_URL;
  console.log("API URL: ", apiUrl);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const op = useRef<OverlayPanel>(null);
  const [page, setPage] = useState<number>(1);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [deselected, setDeselected] = useState<Set<number>>(new Set());
  const [rowCount, setRowCount] = useState<number>(0);

  const HandleRowCount = () => {
    let productsToSelect: Product[] = [];
    if (page * 12 < rowCount) {
      // console.log("page: ", page);
      productsToSelect = products.slice(0, rowCount);
    } else if (page * 12 >= rowCount && (page - 1) * 12 <= rowCount) {
      const rows = rowCount - (page - 1) * 12;
      // console.log("rows: ", rows);
      productsToSelect = rows > 0 ? products.slice(0, rows) : [];
    }
    productsToSelect = productsToSelect.filter(product => !deselected.has(product.id));
    setSelectedProducts([...productsToSelect]);
  };

  const HandleRowCounter = () => {
    HandleRowCount();
    setPage(1);
    op.current?.hide();
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`${apiUrl}?page=${page}`);
      const data = await response.json();
      // console.log(data);
      const Products: Product[] = data.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        place_of_origin: item.place_of_origin,
        artist_display: item.artist_display,
        inscriptions: item.inscriptions || "N/A",
        date_start: item.date_start,
        date_end: item.date_end,
      }));
      setProducts(Products);
      if (selectAll) {
        const newSelectedProducts = Products.filter(product => !deselected.has(product.id));
        setSelectedProducts(newSelectedProducts);
      }
    };
    fetchData();
  }, [page]);



  const handleSelectionChange = (e: DataTableSelectionMultipleChangeEvent<Product[]>) => {
    if (selectAll || rowCount > 0) {
      const newDeselected = new Set(deselected);
      products.forEach(product => {
        if (!e.value?.some(selected => selected.id === product.id)) {
          newDeselected.add(product.id);
        } else {
          newDeselected.delete(product.id);
        }
      });
      setDeselected(newDeselected);

      const newSelectedProducts = products.filter(product => !newDeselected.has(product.id));
      setSelectedProducts(newSelectedProducts);
    } else {
      setSelectedProducts(e.value || []);
    }
  };

  useEffect(() => {
    if (rowCount > 0) {
      HandleRowCount();
    }
  }, [products]);

  const headerTemplate = () => {
    return (
      <div className="flex items-center justify-center gap-2">
        <Button
          icon="pi pi-chevron-down"
          text
          rounded
          className="p-0"
          onClick={(e) => op.current?.toggle(e)}
        />

      </div>

    );
  };

  const selectAllHeaderTemplate = () => (
    <input
      className=" absolute z-10 w-6 h-6 top-7 cursor-pointer"
      type="checkbox"
      checked={selectAll}
      onChange={(e) => {
        const checked = e.target.checked;
        setSelectAll(checked);
        if (!checked) { setSelectedProducts([]); setDeselected(new Set()); }
        else {
          setSelectedProducts(products);
        }
      }}
    />
  );


  return (
    <div className="card p-6">

      <DataTable
        value={products}
        paginator
        lazy
        rows={products.length}
        first={(page - 1) * 12}
        totalRecords={10000}
        onPage={(e) => setPage(e.page! + 1)}
        selectionMode={"checkbox"}
        selection={selectedProducts}
        onSelectionChange={handleSelectionChange}
        dataKey="id"
        tableStyle={{ minWidth: "50rem" }}
      >
        <Column selectionMode="multiple" header={selectAllHeaderTemplate} headerStyle={{ position: "relative" }} />
        <Column header={headerTemplate} headerStyle={{ width: "3rem" }} />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Place of Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Date Start" />
        <Column field="date_end" header="Date End" />
      </DataTable>

      <OverlayPanel ref={op}>
        <div className="flex flex-col items-center gap-4">
          <input
            type="number"
            placeholder="Enter number of rows"
            value={rowCount}
            onChange={(e) => setRowCount(Number(e.target.value))}
            className="p-inputtext p-component w-full"
          />
          <Button label="Select Rows" onClick={HandleRowCounter} />
        </div>
      </OverlayPanel>

    </div>
  );
}
