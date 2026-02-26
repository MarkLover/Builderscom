import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { commercialOffersService, CommercialOffer, Room, Work, Material } from '@/services/commercial-offers.service';
import { employeesService } from '@/services/employees.service';
import { usersService } from '@/services/users.service';

interface CommercialOffersProps {
  user: any;
}

export const CommercialOffers = ({ user }: CommercialOffersProps) => {
  const [offers, setOffers] = useState<CommercialOffer[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [isWorkDialogOpen, setIsWorkDialogOpen] = useState(false);
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false);
  const [selectedWorkTemplate, setSelectedWorkTemplate] = useState('');
  const debounceRef = React.useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Fetch offers and employees on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [offersData, employeesData] = await Promise.all([
        commercialOffersService.getAll(),
        employeesService.getAll()
      ]);
      setOffers(offersData);
      setEmployees(employeesData);
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить данные', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const workTemplates = [
    { name: 'Штукатурка стен', unit: 'м2' as const, price: 450 },
    { name: 'Шпаклевка стен под покраску', unit: 'м2' as const, price: 350 },
    { name: 'Поклейка обоев', unit: 'м2' as const, price: 250 },
    { name: 'Укладка плитки на пол', unit: 'м2' as const, price: 800 },
    { name: 'Укладка плитки на стены', unit: 'м2' as const, price: 900 },
    { name: 'Укладка ламината', unit: 'м2' as const, price: 400 },
    { name: 'Монтаж натяжного потолка', unit: 'м2' as const, price: 550 },
    { name: 'Окраска стен', unit: 'м2' as const, price: 300 },
    { name: 'Окраска потолка', unit: 'м2' as const, price: 280 },
    { name: 'Устройство стяжки пола', unit: 'м2' as const, price: 500 },
    { name: 'Гидроизоляция пола', unit: 'м2' as const, price: 350 },
    { name: 'Монтаж гипсокартона на стены', unit: 'м2' as const, price: 450 },
    { name: 'Монтаж гипсокартона на потолок', unit: 'м2' as const, price: 500 },
    { name: 'Устройство перегородки', unit: 'м2' as const, price: 1200 },
    { name: 'Установка двери межкомнатной', unit: 'шт' as const, price: 3500 },
    { name: 'Установка двери входной', unit: 'шт' as const, price: 5000 },
    { name: 'Монтаж плинтуса', unit: 'мп' as const, price: 150 },
    { name: 'Монтаж карниза потолочного', unit: 'мп' as const, price: 200 },
    { name: 'Электромонтажные работы', unit: 'шт' as const, price: 800 },
    { name: 'Монтаж розетки/выключателя', unit: 'шт' as const, price: 500 },
    { name: 'Монтаж светильника', unit: 'шт' as const, price: 600 },
    { name: 'Прокладка кабеля', unit: 'мп' as const, price: 250 },
    { name: 'Сантехнические работы', unit: 'шт' as const, price: 1500 },
    { name: 'Установка унитаза', unit: 'шт' as const, price: 2500 },
    { name: 'Установка раковины', unit: 'шт' as const, price: 2000 },
    { name: 'Установка ванны', unit: 'шт' as const, price: 4000 },
    { name: 'Установка душевой кабины', unit: 'шт' as const, price: 5000 },
    { name: 'Установка смесителя', unit: 'шт' as const, price: 1500 },
    { name: 'Установка полотенцесушителя', unit: 'шт' as const, price: 2000 },
    { name: 'Прокладка труб водоснабжения', unit: 'мп' as const, price: 400 },
    { name: 'Прокладка канализации', unit: 'мп' as const, price: 450 },
    { name: 'Демонтаж стяжки', unit: 'м2' as const, price: 300 },
    { name: 'Демонтаж плитки', unit: 'м2' as const, price: 250 },
    { name: 'Демонтаж перегородок', unit: 'м2' as const, price: 400 },
    { name: 'Вывоз мусора', unit: 'м2' as const, price: 100 },
  ];

  const handleWorkTemplateChange = (value: string) => {
    setSelectedWorkTemplate(value);
    if (value && value !== 'custom') {
      const template = workTemplates.find(t => t.name === value);
      if (template) {
        const form = document.getElementById('workForm') as HTMLFormElement;
        if (form) {
          (form.elements.namedItem('name') as HTMLInputElement).value = template.name;
          (form.elements.namedItem('price') as HTMLInputElement).value = template.price.toString();
          (form.elements.namedItem('unit') as HTMLSelectElement).value = template.unit;
        }
      }
    } else if (value === 'custom') {
      const form = document.getElementById('workForm') as HTMLFormElement;
      if (form) {
        (form.elements.namedItem('name') as HTMLInputElement).value = '';
        (form.elements.namedItem('price') as HTMLInputElement).value = '';
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, offerId: number) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    try {
      setIsUploading(true);
      const { url } = await commercialOffersService.uploadFile(file);
      await handleUpdateOffer(offerId, { planImage: url });
      toast({ title: 'Успешно', description: 'План помещения загружен' });
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить файл', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogoUpdate = async (url: string) => {
    try {
      // We need to update the user context/state as well.
      // Assuming 'user' is passed as prop and parent handles update or we reload.
      // Since we can't easily update parent state from here without a callback, we'll just call API and reload page or use a callback if available.
      // For now, let's assume we need to emit an event or just refresh (not ideal).
      // Ideally, CommercialOffers should receive a `onUserUpdate` prop.
      // Let's check props. Only `user` is passed.
      // We will update via API, and then maybe force a reload or just let the user know.

      if (user && user.id) {
        await usersService.update(user.id, { logo: url });
        user.logo = url; // Mutate prop locally for immediate feedback (anti-pattern but effective for now)
        toast({ title: 'Успешно', description: 'Логотип обновлен' });
        // Force re-render?
        setOffers([...offers]);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось обновить логотип', variant: 'destructive' });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    try {
      setIsUploading(true);
      const { url } = await commercialOffersService.uploadFile(file);
      await handleLogoUpdate(url);
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить логотип', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddOffer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const newOffer = await commercialOffersService.create({
        address: formData.get('address') as string,
        customerName: formData.get('customerName') as string || undefined,
        customerPhone: formData.get('customerPhone') as string || undefined,
      });
      setOffers([newOffer, ...offers]);
      setIsOfferDialogOpen(false);
      toast({ title: 'КП создано', description: 'Коммерческое предложение успешно создано' });
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось создать КП', variant: 'destructive' });
    }
  };

  const handleUpdateOffer = async (id: number, data: any) => {
    try {
      const updatedOffer = await commercialOffersService.update(id, data);
      setOffers(offers.map(o => o.id === id ? updatedOffer : o));
      if (selectedOffer === id) {
        // Force refresh if strictly needed, but state update should handle it
      }
      toast({ title: 'КП обновлено', description: 'Изменения сохранены' });
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось обновить КП', variant: 'destructive' });
    }
  };

  const handleDebouncedDiscountUpdate = (offerId: number, discount: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleUpdateOffer(offerId, { discount, discountType: 'percent' });
    }, 500);
  };

  const handleAddRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedOffer) return;

    const formData = new FormData(e.currentTarget);

    try {
      const newRoom = await commercialOffersService.addRoom(selectedOffer, {
        name: formData.get('name') as string,
        area: Number(formData.get('area')),
        wallArea: Number(formData.get('wallArea')),
      });

      setOffers(offers.map(offer =>
        offer.id === selectedOffer
          ? { ...offer, rooms: [...offer.rooms, newRoom] }
          : offer
      ));

      setIsRoomDialogOpen(false);
      toast({ title: 'Помещение добавлено', description: `${newRoom.name} успешно добавлено` });
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось добавить помещение', variant: 'destructive' });
    }
  };

  const handleAddWork = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedRoom) return;

    const formData = new FormData(e.currentTarget);

    try {
      const newWork = await commercialOffersService.addWork(selectedRoom, {
        name: formData.get('name') as string,
        quantity: Number(formData.get('quantity')),
        unit: formData.get('unit') as string,
        price: Number(formData.get('price')),
        discount: Number(formData.get('discount')) || 0,
        discountType: 'percent',
      });

      setOffers(offers.map(offer =>
        offer.id === selectedOffer
          ? {
            ...offer,
            rooms: offer.rooms.map(room =>
              room.id === selectedRoom
                ? { ...room, works: [...room.works, newWork] }
                : room
            )
          }
          : offer
      ));

      setIsWorkDialogOpen(false);
      toast({ title: 'Работа добавлена', description: `${newWork.name} добавлена в помещение` });
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось добавить работу', variant: 'destructive' });
    }
  };

  const handleAddMaterial = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedRoom) return;

    const formData = new FormData(e.currentTarget);

    try {
      const newMaterial = await commercialOffersService.addMaterial(selectedRoom, {
        name: formData.get('name') as string,
        quantity: Number(formData.get('quantity')),
        unit: formData.get('unit') as string,
        price: Number(formData.get('price')),
        discount: Number(formData.get('discount')) || 0,
        discountType: 'percent',
      });

      setOffers(offers.map(offer =>
        offer.id === selectedOffer
          ? {
            ...offer,
            rooms: offer.rooms.map(room =>
              room.id === selectedRoom
                ? { ...room, materials: [...room.materials, newMaterial] }
                : room
            )
          }
          : offer
      ));

      setIsMaterialDialogOpen(false);
      toast({ title: 'Материал добавлен', description: `${newMaterial.name} добавлен в помещение` });
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось добавить материал', variant: 'destructive' });
    }
  };

  const calculateItemTotal = (item: Work | Material) => {
    let total = item.quantity * item.price;
    if (item.discount) {
      if (item.discountType === 'percent') {
        total = total * (1 - item.discount / 100);
      } else {
        total = total - item.discount;
      }
    }
    return total;
  };

  const calculateRoomTotal = (room: Room) => {
    const worksTotal = room.works.reduce((sum, work) => sum + calculateItemTotal(work), 0);
    const materialsTotal = room.materials.reduce((sum, material) => sum + calculateItemTotal(material), 0);
    return worksTotal + materialsTotal;
  };

  const calculateOfferTotal = (offer: CommercialOffer) => {
    const subtotal = offer.rooms.reduce((sum, room) => sum + calculateRoomTotal(room), 0);
    if (offer.discount) {
      if (offer.discountType === 'percent') {
        return subtotal * (1 - offer.discount / 100);
      } else {
        return subtotal - offer.discount;
      }
    }
    return subtotal;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU');
  };

  const exportToPDF = async (offer: CommercialOffer, logoUrl?: string) => {
    // Fetch fonts and images
    let fontBase64: string;
    let fontBoldBase64: string;
    let logoBase64: string | null = null;

    try {
      const [normalResp, boldResp] = await Promise.all([
        fetch('https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf'),
        fetch('https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-Bold.ttf'),
      ]);
      const [normalBuf, boldBuf] = await Promise.all([normalResp.arrayBuffer(), boldResp.arrayBuffer()]);
      const toBase64 = (buf: ArrayBuffer) =>
        btoa(new Uint8Array(buf).reduce((data, byte) => data + String.fromCharCode(byte), ''));
      fontBase64 = toBase64(normalBuf);
      fontBoldBase64 = toBase64(boldBuf);

      if (logoUrl) {
        try {
          // Function to convert image URL to base64 using canvas to avoid some CORS issues if it's cached or on same domain
          const getBase64FromUrl = async (url: string) => {
            const data = await fetch(url, { mode: 'cors', cache: 'no-cache' });
            const blob = await data.blob();
            return new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
            });
          }
          logoBase64 = await getBase64FromUrl(logoUrl);
        } catch (e) {
          console.error("Failed to load logo", e);
        }
      }

    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить ресурсы для PDF', variant: 'destructive' });
      return;
    }

    const doc = new jsPDF();
    doc.addFileToVFS('DejaVuSans.ttf', fontBase64);
    doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal');
    doc.addFileToVFS('DejaVuSans-Bold.ttf', fontBoldBase64);
    doc.addFont('DejaVuSans-Bold.ttf', 'DejaVuSans', 'bold');
    doc.setFont('DejaVuSans');

    const pageWidth = doc.internal.pageSize.getWidth();

    // === COVER PAGE ===
    // Logo
    if (logoBase64) {
      try {
        // Strip data prefix like 'data:image/png;base64,' for jsPDF
        const base64Data = logoBase64.split(',')[1] || logoBase64;
        const ext = logoBase64.includes('png') ? 'PNG' : 'JPEG';
        doc.addImage(base64Data, ext, 20, 20, 50, 20, undefined, 'FAST');
      } catch (e) {
        console.error("Failed to add logo to PDF", e);
      }
    } else {
      // Fallback if no logo
      doc.setFontSize(22);
      doc.setFont('DejaVuSans', 'bold');
      const companyName = user.company || user.name || 'Компания';
      // Split into lines if too long or just print
      doc.text(companyName, 20, 30);
    }

    // Title
    doc.setFont('DejaVuSans', 'bold');
    doc.setFontSize(16);
    doc.text('Коммерческое предложение', pageWidth - 20, 40, { align: 'right' });
    doc.setFontSize(14);
    doc.text(`№ ${offer.id}`, pageWidth - 20, 48, { align: 'right' });

    // Central Image (Plan)
    if (offer.planImage) {
      try {
        const planResp = await fetch(offer.planImage);
        const planBuf = await planResp.arrayBuffer();
        const planBase64 = btoa(new Uint8Array(planBuf).reduce((data, byte) => data + String.fromCharCode(byte), ''));
        const ext = offer.planImage.split('.').pop()?.toUpperCase();
        // Simple mapping for common extensions, or let jsPDF guess if passed undefined/null? NO, explicit is safer.
        // But 'JPG' -> 'JPEG' mapping might be needed.
        let format = 'JPEG';
        if (ext === 'PNG') format = 'PNG';
        if (ext === 'WEBP') format = 'WEBP'; // jsPDF might not support WEBP in all versions, but let's try.

        doc.addImage(planBase64, format as any, 20, 70, pageWidth - 40, 100);
      } catch (e) {
        console.error("Failed to load plan image", e);
        doc.setFillColor(240, 240, 240);
        doc.rect(20, 70, pageWidth - 40, 100, 'F');
        doc.setFont('DejaVuSans', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(150);
        doc.text('Эскиз / План помещения (Ошибка загрузки)', pageWidth / 2, 120, { align: 'center' });
        doc.setTextColor(0);
      }
    } else {
      doc.setFillColor(240, 240, 240);
      doc.rect(20, 70, pageWidth - 40, 100, 'F');
      doc.setFont('DejaVuSans', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(150);
      doc.text('Эскиз / План помещения', pageWidth / 2, 120, { align: 'center' });
      doc.setTextColor(0);
    }

    // Bottom Details
    const startY = 200;
    doc.setFontSize(11);

    doc.setFont('DejaVuSans', 'bold');
    doc.text('Объект:', 20, startY);
    doc.setFont('DejaVuSans', 'normal');
    doc.text(offer.address, 60, startY);

    doc.setFont('DejaVuSans', 'bold');
    doc.text('Заказчик:', 20, startY + 10);
    doc.setFont('DejaVuSans', 'normal');
    let customerText = offer.customerName || '-';
    if (offer.customerPhone) customerText += ` (${offer.customerPhone})`;
    doc.text(customerText, 60, startY + 10);

    doc.setFont('DejaVuSans', 'bold');
    doc.text('Исполнитель:', 20, startY + 20);
    doc.setFont('DejaVuSans', 'normal');

    let executorName = 'Валеев Чингиз Ринатович';
    if (offer.executor && offer.executor.name) {
      executorName = offer.executor.name;
    } else if (offer.executorId) {
      const emp = employees.find(e => e.id === offer.executorId);
      if (emp) executorName = emp.name;
    }
    doc.text(executorName, 60, startY + 20);

    doc.setFont('DejaVuSans', 'bold');
    doc.text('Дата:', 20, startY + 30);
    doc.setFont('DejaVuSans', 'normal');
    doc.text(formatDate(offer.createdAt), 60, startY + 30);

    // === CONTENT PAGES ===
    doc.addPage();
    let yPosition = 20;

    // Headers
    doc.setFontSize(14);
    doc.setFont('DejaVuSans', 'bold');
    doc.text('Смета работ и материалов', 14, yPosition);
    yPosition += 15;

    const calculateItemTotalPDF = (qty: number, price: number, discount: number, discountType: string) => {
      let total = qty * price;
      if (discount) {
        if (discountType === 'percent') {
          total = total * (1 - discount / 100);
        } else {
          total = total - discount;
        }
      }
      return total;
    }

    const renderRoomCategory = (title: string, items: Array<{ name: string, qty: number, unit: string, price: number, discount: number, discountType: string }>, color: [number, number, number]) => {
      if (items.length === 0) return 0;

      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(11);
      doc.setFont('DejaVuSans', 'bold');
      doc.setTextColor(50);
      doc.text(title, 14, yPosition);
      yPosition += 5;

      const rows = items.map(item => {
        const total = calculateItemTotalPDF(item.qty, item.price, item.discount, item.discountType);
        let discountText = '-';
        if (item.discount) {
          discountText = item.discountType === 'percent' ? `${item.discount}%` : `${item.discount} ₽`;
        }

        return [
          item.name,
          `${item.qty} ${item.unit}`,
          `${item.price.toLocaleString('ru-RU')} ₽`,
          discountText,
          `${total.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽`
        ]
      });

      autoTable(doc, {
        startY: yPosition,
        head: [['Наименование', 'Кол-во', 'Цена', 'Скидка', 'Стоимость']],
        body: rows,
        theme: 'grid',
        styles: { font: 'DejaVuSans', fontStyle: 'normal', fontSize: 8 },
        headStyles: { fillColor: color, fontStyle: 'bold', fontSize: 9 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 3;

      const categoryTotal = items.reduce((sum, item) => sum + calculateItemTotalPDF(item.qty, item.price, item.discount, item.discountType), 0);
      doc.setFontSize(10);
      doc.setFont('DejaVuSans', 'bold');
      doc.setTextColor(0);
      doc.text(`Итого: ${categoryTotal.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽`, 14, yPosition);
      yPosition += 10;

      return categoryTotal;
    };

    let sumAllItems = 0;

    offer.rooms.forEach(room => {
      if (yPosition > 240) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(13);
      doc.setFont('DejaVuSans', 'bold');
      doc.setTextColor(0);
      doc.text(`Помещение: ${room.name}`, 14, yPosition);
      yPosition += 8;

      const materialItems = room.materials.map(m => ({
        name: m.name, qty: m.quantity, unit: m.unit, price: m.price, discount: m.discount || 0, discountType: m.discountType || 'percent'
      }));

      const serviceItems = room.works.map(w => ({
        name: w.name, qty: w.quantity, unit: w.unit, price: w.price, discount: w.discount || 0, discountType: w.discountType || 'percent'
      }));

      let roomTotal = 0;
      roomTotal += renderRoomCategory('Материалы', materialItems, [34, 197, 94]);
      roomTotal += renderRoomCategory('Работы', serviceItems, [79, 70, 229]);

      sumAllItems += roomTotal;

      doc.setFontSize(11);
      doc.setFont('DejaVuSans', 'bold');
      doc.setTextColor(0);
      doc.text(`Итого по помещению '${room.name}': ${roomTotal.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽`, 14, yPosition);
      yPosition += 15;
    });

    // Grand Total
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }

    yPosition += 10;
    doc.setFontSize(12);
    doc.setTextColor(0);
    yPosition += 7;

    if (offer.discount) {
      const discountStr = offer.discountType === 'percent' ? `${offer.discount}%` : `${offer.discount} ₽`;
      doc.text(`Скидка на смету: ${discountStr}`, 14, yPosition);
      yPosition += 7;
    }

    const finalTotal = calculateOfferTotal(offer);

    doc.setFontSize(14);
    doc.setTextColor(220, 38, 38); // Red color for final price
    doc.text(`ИТОГО К ОПЛАТЕ: ${finalTotal.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽`, 14, yPosition);

    doc.save(`КП_${offer.address}_${formatDate(offer.createdAt)}.pdf`);
    toast({ title: 'PDF создан', description: 'Коммерческое предложение экспортировано в PDF' });
  };

  const exportToExcel = (offer: CommercialOffer) => {
    const workbook = XLSX.utils.book_new();

    const summaryData: any[][] = [
      ['КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ'],
      [],
      ['Адрес:', offer.address],
    ];

    if (offer.customerName) {
      summaryData.push(['Заказчик:', offer.customerName]);
    }
    summaryData.push(['Дата:', formatDate(offer.createdAt)]);

    // Categorize items by room
    const calculateItemTotalExcel = (qty: number, price: number, discount: number, discountType: string) => {
      let total = qty * price;
      if (discount) {
        if (discountType === 'percent') {
          total = total * (1 - discount / 100);
        } else {
          total = total - discount;
        }
      }
      return total;
    }

    const addCategoryToSummary = (title: string, items: Array<{ name: string, qty: number, unit: string, price: number, discount: number, discountType: string }>) => {
      if (items.length === 0) return 0;

      summaryData.push([]);
      summaryData.push([title]);
      summaryData.push(['Наименование', 'Кол-во', 'Ед.', 'Цена, ₽', 'Скидка', 'Стоимость, ₽']);

      let categoryTotal = 0;
      items.forEach(item => {
        const total = calculateItemTotalExcel(item.qty, item.price, item.discount, item.discountType);
        categoryTotal += total;
        let discountText = '-';
        if (item.discount) {
          discountText = item.discountType === 'percent' ? `${item.discount}%` : `${item.discount} ₽`;
        }

        summaryData.push([
          item.name,
          item.qty,
          item.unit,
          item.price.toFixed(2),
          discountText,
          total.toFixed(2)
        ]);
      });

      summaryData.push(['', '', '', '', 'Итого:', categoryTotal.toFixed(2)]);
      return categoryTotal;
    };

    offer.rooms.forEach(room => {
      summaryData.push([]);
      summaryData.push([`ПОМЕЩЕНИЕ: ${room.name.toUpperCase()}`]);

      const materialItems = room.materials.map(m => ({
        name: m.name, qty: m.quantity, unit: m.unit, price: m.price, discount: m.discount || 0, discountType: m.discountType || 'percent'
      }));

      const serviceItems = room.works.map(w => ({
        name: w.name, qty: w.quantity, unit: w.unit, price: w.price, discount: w.discount || 0, discountType: w.discountType || 'percent'
      }));

      let roomTotal = 0;
      roomTotal += addCategoryToSummary('МАТЕРИАЛЫ', materialItems);
      roomTotal += addCategoryToSummary('РАБОТЫ', serviceItems);

      summaryData.push(['', '', '', '', `Итого по помещению '${room.name}':`, roomTotal.toFixed(2)]);
    });

    summaryData.push([]);

    // Total without general discount
    const subtotal = offer.rooms.reduce((sum, room) => sum + calculateRoomTotal(room), 0);
    summaryData.push(['СУММА:', '', '', '', '', subtotal.toFixed(2)]);

    if (offer.discount) {
      const discountStr = offer.discountType === 'percent' ? `${offer.discount}%` : `${offer.discount} ₽`;
      summaryData.push(['СКИДКА НА СМЕТУ:', '', '', '', '', discountStr]);
    }

    const grandTotal = calculateOfferTotal(offer);
    summaryData.push(['ИТОГОВАЯ СТОИМОСТЬ:', '', '', '', '', grandTotal.toFixed(2)]);

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Сводка');

    XLSX.writeFile(workbook, `КП_${offer.address}_${formatDate(offer.createdAt)}.xlsx`);
    toast({ title: 'Excel создан', description: 'Коммерческое предложение экспортировано в Excel' });
  };

  const currentOffer = selectedOffer ? offers.find(o => o.id === selectedOffer) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icon name="Loader2" size={32} className="animate-spin" />
      </div>
    );
  }

  if (currentOffer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <Button variant="ghost" onClick={() => setSelectedOffer(null)} className="mb-2">
              <Icon name="ArrowLeft" size={18} className="mr-2" />
              Назад к списку
            </Button>
            <h2 className="text-2xl font-bold">{currentOffer.address}</h2>
            {currentOffer.customerName && (
              <p className="text-muted-foreground">Заказчик: {currentOffer.customerName}</p>
            )}
            <p className="text-muted-foreground">Создано: {formatDate(currentOffer.createdAt)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Общая сумма</p>
            <p className="text-3xl font-bold text-primary">
              {calculateOfferTotal(currentOffer).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
            </p>
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={() => {
                exportToPDF(currentOffer, user.logo);
              }}>
                <Icon name="FileDown" size={16} className="mr-1" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportToExcel(currentOffer)}>
                <Icon name="FileSpreadsheet" size={16} className="mr-1" />
                Excel
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              <div className="mt-4 space-y-3 p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-center gap-2 justify-between">
                  <Label htmlFor="globalDiscount" className="text-sm font-medium">Скидка на смету (%):</Label>
                  <Input
                    id="globalDiscount"
                    type="number"
                    className="w-32 h-8 bg-background"
                    placeholder="0"
                    defaultValue={currentOffer.discount || 0}
                    onChange={(e) => handleDebouncedDiscountUpdate(currentOffer.id, Number(e.target.value))}
                  />
                </div>

                <div className="flex items-center gap-2 justify-between">
                  <Label className="text-sm font-medium">Исполнитель:</Label>
                  <div className="w-48">
                    <Select
                      value={currentOffer.executorId?.toString()}
                      onValueChange={(val) => handleUpdateOffer(currentOffer.id, { executorId: Number(val) })}
                    >
                      <SelectTrigger className="h-8 bg-background w-full">
                        <SelectValue placeholder="Выберите..." />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((emp: any) => (
                          <SelectItem key={emp.id} value={emp.id.toString()}>
                            {emp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-between">
                  <Label htmlFor="logoUrlDetails" className="text-sm font-medium">Логотип:</Label>
                  <div className="flex items-center gap-2 w-48 justify-end">
                    {user.logo ? (
                      <div className="flex items-center gap-2">
                        <img src={user.logo} alt="Logo" className="h-8 w-auto object-contain bg-white rounded border" />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleLogoUpdate('')}
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground mr-2">Нет логотипа</span>
                    )}

                    <div className="relative">
                      <Input
                        type="file"
                        id="logoUpload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={isUploading}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => document.getElementById('logoUpload')?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Upload" size={14} />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-between">
                  <Label className="text-sm font-medium">План помещения:</Label>
                  <div className="flex items-center gap-2 w-48 justify-end">
                    {currentOffer.planImage && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a href={currentOffer.planImage} target="_blank" rel="noopener noreferrer">
                          <Icon name="Eye" size={14} />
                        </a>
                      </Button>
                    )}
                    <div className="relative">
                      <Input
                        type="file"
                        id="planImageUpload"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, currentOffer.id)}
                        disabled={isUploading}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => document.getElementById('planImageUpload')?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Upload" size={14} />}
                        <span className="ml-2">Загрузить</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Icon name="Plus" size={18} className="mr-2" />
                Добавить помещение
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новое помещение</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddRoom} className="space-y-4">
                <div>
                  <Label htmlFor="name">Название помещения *</Label>
                  <Input id="name" name="name" placeholder="Гостиная" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="area">Площадь пола, м² *</Label>
                    <Input id="area" name="area" type="number" step="0.01" placeholder="20.5" required />
                  </div>
                  <div>
                    <Label htmlFor="wallArea">Площадь стен, м² *</Label>
                    <Input id="wallArea" name="wallArea" type="number" step="0.01" placeholder="45.8" required />
                  </div>
                </div>
                <Button type="submit" className="w-full">Добавить помещение</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {currentOffer.rooms.map(room => (
            <Card key={room.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{room.name}</CardTitle>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      <span>Пол: {room.area} м²</span>
                      <span>Стены: {room.wallArea} м²</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Сумма</p>
                    <p className="text-xl font-bold">
                      {calculateRoomTotal(room).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Icon name="Wrench" size={16} />
                      Работы
                    </h4>
                    <Dialog open={isWorkDialogOpen} onOpenChange={setIsWorkDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRoom(room.id)}
                        >
                          <Icon name="Plus" size={16} className="mr-1" />
                          Добавить
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Добавить работу</DialogTitle>
                        </DialogHeader>
                        <form id="workForm" onSubmit={handleAddWork} className="space-y-4">
                          <div>
                            <Label htmlFor="workTemplate">Выбрать из списка</Label>
                            <select
                              id="workTemplate"
                              className="w-full border rounded-lg px-3 py-2 text-sm"
                              value={selectedWorkTemplate}
                              onChange={(e) => handleWorkTemplateChange(e.target.value)}
                            >
                              <option value="">Выберите типовую работу</option>
                              <optgroup label="Отделочные работы">
                                <option value="Штукатурка стен">Штукатурка стен</option>
                                <option value="Шпаклевка стен под покраску">Шпаклевка стен под покраску</option>
                                <option value="Поклейка обоев">Поклейка обоев</option>
                                <option value="Окраска стен">Окраска стен</option>
                                <option value="Окраска потолка">Окраска потолка</option>
                              </optgroup>
                              <optgroup label="Полы и потолки">
                                <option value="Укладка плитки на пол">Укладка плитки на пол</option>
                                <option value="Укладка плитки на стены">Укладка плитки на стены</option>
                                <option value="Укладка ламината">Укладка ламината</option>
                                <option value="Монтаж натяжного потолка">Монтаж натяжного потолка</option>
                                <option value="Устройство стяжки пола">Устройство стяжки пола</option>
                                <option value="Гидроизоляция пола">Гидроизоляция пола</option>
                              </optgroup>
                              <optgroup label="Гипсокартон">
                                <option value="Монтаж гипсокартона на стены">Монтаж гипсокартона на стены</option>
                                <option value="Монтаж гипсокартона на потолок">Монтаж гипсокартона на потолок</option>
                                <option value="Устройство перегородки">Устройство перегородки</option>
                              </optgroup>
                              <optgroup label="Двери и декор">
                                <option value="Установка двери межкомнатной">Установка двери межкомнатной</option>
                                <option value="Установка двери входной">Установка двери входной</option>
                                <option value="Монтаж плинтуса">Монтаж плинтуса</option>
                                <option value="Монтаж карниза потолочного">Монтаж карниза потолочного</option>
                              </optgroup>
                              <optgroup label="Электрика">
                                <option value="Электромонтажные работы">Электромонтажные работы</option>
                                <option value="Монтаж розетки/выключателя">Монтаж розетки/выключателя</option>
                                <option value="Монтаж светильника">Монтаж светильника</option>
                                <option value="Прокладка кабеля">Прокладка кабеля</option>
                              </optgroup>
                              <optgroup label="Сантехника">
                                <option value="Сантехнические работы">Сантехнические работы</option>
                                <option value="Установка унитаза">Установка унитаза</option>
                                <option value="Установка раковины">Установка раковины</option>
                                <option value="Установка ванны">Установка ванны</option>
                                <option value="Установка душевой кабины">Установка душевой кабины</option>
                                <option value="Установка смесителя">Установка смесителя</option>
                                <option value="Установка полотенцесушителя">Установка полотенцесушителя</option>
                                <option value="Прокладка труб водоснабжения">Прокладка труб водоснабжения</option>
                                <option value="Прокладка канализации">Прокладка канализации</option>
                              </optgroup>
                              <optgroup label="Демонтаж">
                                <option value="Демонтаж стяжки">Демонтаж стяжки</option>
                                <option value="Демонтаж плитки">Демонтаж плитки</option>
                                <option value="Демонтаж перегородок">Демонтаж перегородок</option>
                                <option value="Вывоз мусора">Вывоз мусора</option>
                              </optgroup>
                              <option value="custom">➕ Своя работа</option>
                            </select>
                          </div>
                          <div>
                            <Label htmlFor="workName">Название работы *</Label>
                            <Input id="workName" name="name" placeholder="Штукатурка стен" required />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="workQuantity">Количество *</Label>
                              <Input id="workQuantity" name="quantity" type="number" step="0.01" placeholder="45.8" required />
                            </div>
                            <div>
                              <Label htmlFor="workUnit">Единица *</Label>
                              <select id="workUnit" name="unit" className="w-full border rounded-lg px-3 py-2 text-sm" required>
                                <option value="м2">м²</option>
                                <option value="шт">шт</option>
                                <option value="мп">мп</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="workPrice">Цена за единицу, ₽ *</Label>
                            <Input id="workPrice" name="price" type="number" step="0.01" placeholder="450" required />
                          </div>
                          <Button type="submit" className="w-full">Добавить работу</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  {room.works.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Работы не добавлены</p>
                  ) : (
                    <div className="space-y-2">
                      {room.works.map(work => (
                        <div key={work.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">{work.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {work.quantity} {work.unit} × {work.price.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽
                            </p>
                          </div>
                          <p className="font-semibold">
                            {(work.quantity * work.price).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Icon name="Package" size={16} />
                      Материалы
                    </h4>
                    <Dialog open={isMaterialDialogOpen} onOpenChange={setIsMaterialDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRoom(room.id)}
                        >
                          <Icon name="Plus" size={16} className="mr-1" />
                          Добавить
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Добавить материал</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddMaterial} className="space-y-4">
                          <div>
                            <Label htmlFor="materialName">Название материала *</Label>
                            <Input id="materialName" name="name" placeholder="Штукатурка Кнауф" required />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="materialQuantity">Количество *</Label>
                              <Input id="materialQuantity" name="quantity" type="number" step="0.01" placeholder="15" required />
                            </div>
                            <div>
                              <Label htmlFor="materialUnit">Единица *</Label>
                              <select id="materialUnit" name="unit" className="w-full border rounded-lg px-3 py-2 text-sm" required>
                                <option value="шт">шт</option>
                                <option value="упаковок">упаковок</option>
                                <option value="кг">кг</option>
                                <option value="мп">мп</option>
                                <option value="м2">м²</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="materialPrice">Цена за единицу, ₽ *</Label>
                            <Input id="materialPrice" name="price" type="number" step="0.01" placeholder="380" required />
                          </div>
                          <Button type="submit" className="w-full">Добавить материал</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  {room.materials.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Материалы не добавлены</p>
                  ) : (
                    <div className="space-y-2">
                      {room.materials.map(material => (
                        <div key={material.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">{material.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {material.quantity} {material.unit} × {material.price.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽
                            </p>
                          </div>
                          <p className="font-semibold">
                            {(material.quantity * material.price).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {currentOffer.rooms.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <Icon name="Home" size={48} className="mx-auto mb-2 opacity-50" />
              <p>Помещения не добавлены</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Коммерческие предложения</h2>
          <p className="text-muted-foreground">Создание коммерческих предложений для клиентов</p>
        </div>
        <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Icon name="Plus" size={18} className="mr-2" />
              Создать КП
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новое коммерческое предложение</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddOffer} className="space-y-4">
              <div>
                <Label htmlFor="customerName">Имя Фамилия заказчика</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  placeholder="Иван Петров"
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Телефон заказчика</Label>
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  placeholder="+7 (999) 000-00-00"
                />
              </div>
              <div>
                <Label htmlFor="address">Адрес объекта *</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="г. Москва, ул. Ленина, д. 15, кв. 42"
                  required
                />
              </div>
              <Button type="submit" className="w-full">Создать КП</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {offers.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <Icon name="FileText" size={48} className="mx-auto mb-2 opacity-50" />
              <p>Коммерческие предложения не созданы</p>
            </CardContent>
          </Card>
        ) : (
          offers.map(offer => (
            <Card
              key={offer.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedOffer(offer.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="FileText" size={20} />
                      {offer.address}
                    </CardTitle>
                    {offer.customerName && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Заказчик: {offer.customerName}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      Создано: {formatDate(offer.createdAt)} • Помещений: {offer.rooms.length}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Сумма</p>
                    <p className="text-2xl font-bold text-primary">
                      {calculateOfferTotal(offer).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};