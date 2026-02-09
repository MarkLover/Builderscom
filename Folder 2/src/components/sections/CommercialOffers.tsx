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
import { commercialOffersService, CommercialOffer, Room, Work, Material } from '@/services/commercial-offers.service';

interface CommercialOffersProps {
  user: any;
}

export const CommercialOffers = ({ user }: CommercialOffersProps) => {
  const [offers, setOffers] = useState<CommercialOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [isWorkDialogOpen, setIsWorkDialogOpen] = useState(false);
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false);
  const [selectedWorkTemplate, setSelectedWorkTemplate] = useState('');
  const { toast } = useToast();

  // Fetch offers on mount
  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const data = await commercialOffersService.getAll();
      setOffers(data);
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить КП', variant: 'destructive' });
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

  const handleAddOffer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const newOffer = await commercialOffersService.create({
        address: formData.get('address') as string,
      });
      setOffers([newOffer, ...offers]);
      setIsOfferDialogOpen(false);
      toast({ title: 'КП создано', description: 'Коммерческое предложение успешно создано' });
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось создать КП', variant: 'destructive' });
    }
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

  const calculateRoomTotal = (room: Room) => {
    const worksTotal = room.works.reduce((sum, work) => sum + (work.quantity * work.price), 0);
    const materialsTotal = room.materials.reduce((sum, material) => sum + (material.quantity * material.price), 0);
    return worksTotal + materialsTotal;
  };

  const calculateOfferTotal = (offer: CommercialOffer) => {
    return offer.rooms.reduce((sum, room) => sum + calculateRoomTotal(room), 0);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU');
  };

  const exportToPDF = (offer: CommercialOffer) => {
    const doc = new jsPDF();

    doc.addFont('https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf', 'DejaVuSans', 'normal');
    doc.setFont('DejaVuSans');

    doc.setFontSize(18);
    doc.text('Коммерческое предложение', 14, 20);

    doc.setFontSize(12);
    doc.text(`Адрес: ${offer.address}`, 14, 30);
    doc.text(`Дата: ${formatDate(offer.createdAt)}`, 14, 37);

    let yPosition = 50;

    offer.rooms.forEach((room, roomIndex) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('DejaVuSans', 'bold');
      doc.text(`${roomIndex + 1}. ${room.name}`, 14, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      doc.setFont('DejaVuSans', 'normal');
      doc.text(`Площадь пола: ${room.area} м² | Площадь стен: ${room.wallArea} м²`, 14, yPosition);
      yPosition += 10;

      if (room.works.length > 0) {
        const workRows = room.works.map(work => [
          work.name,
          `${work.quantity} ${work.unit}`,
          `${work.price.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽`,
          `${(work.quantity * work.price).toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽`
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [['Работа', 'Количество', 'Цена', 'Сумма']],
          body: workRows,
          theme: 'grid',
          headStyles: { fillColor: [79, 70, 229], font: 'DejaVuSans' },
          bodyStyles: { font: 'DejaVuSans' },
          styles: { fontSize: 9 }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 5;
      }

      if (room.materials.length > 0) {
        const materialRows = room.materials.map(material => [
          material.name,
          `${material.quantity} ${material.unit}`,
          `${material.price.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽`,
          `${(material.quantity * material.price).toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽`
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [['Материал', 'Количество', 'Цена', 'Сумма']],
          body: materialRows,
          theme: 'grid',
          headStyles: { fillColor: [34, 197, 94], font: 'DejaVuSans' },
          bodyStyles: { font: 'DejaVuSans' },
          styles: { fontSize: 9 }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 5;
      }

      doc.setFontSize(11);
      doc.setFont('DejaVuSans', 'bold');
      doc.text(
        `Итого по помещению: ${calculateRoomTotal(room).toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽`,
        14,
        yPosition
      );
      yPosition += 10;
    });

    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('DejaVuSans', 'bold');
    doc.text(
      `ОБЩАЯ СУММА: ${calculateOfferTotal(offer).toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽`,
      14,
      yPosition
    );

    doc.save(`КП_${offer.address}_${formatDate(offer.createdAt)}.pdf`);
    toast({ title: 'PDF создан', description: 'Коммерческое предложение экспортировано в PDF' });
  };

  const exportToExcel = (offer: CommercialOffer) => {
    const workbook = XLSX.utils.book_new();

    const summaryData: any[][] = [
      ['КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ'],
      [],
      ['Адрес:', offer.address],
      ['Дата:', formatDate(offer.createdAt)],
      [],
      ['Помещение', 'Площадь пола, м²', 'Площадь стен, м²', 'Сумма, ₽']
    ];

    offer.rooms.forEach(room => {
      summaryData.push([
        room.name,
        room.area,
        room.wallArea,
        calculateRoomTotal(room).toFixed(2)
      ]);
    });

    summaryData.push([]);
    summaryData.push(['ОБЩАЯ СУММА:', '', '', calculateOfferTotal(offer).toFixed(2)]);

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Сводка');

    offer.rooms.forEach((room, index) => {
      const roomData: any[][] = [
        [`Помещение: ${room.name}`],
        [`Площадь пола: ${room.area} м² | Площадь стен: ${room.wallArea} м²`],
        [],
        ['РАБОТЫ'],
        ['Название', 'Количество', 'Ед. изм.', 'Цена, ₽', 'Сумма, ₽']
      ];

      room.works.forEach(work => {
        roomData.push([
          work.name,
          work.quantity,
          work.unit,
          work.price.toFixed(2),
          (work.quantity * work.price).toFixed(2)
        ]);
      });

      const worksTotal = room.works.reduce((sum, work) => sum + (work.quantity * work.price), 0);
      roomData.push(['', '', '', 'Итого работы:', worksTotal.toFixed(2)]);

      roomData.push([]);
      roomData.push(['МАТЕРИАЛЫ']);
      roomData.push(['Название', 'Количество', 'Ед. изм.', 'Цена, ₽', 'Сумма, ₽']);

      room.materials.forEach(material => {
        roomData.push([
          material.name,
          material.quantity,
          material.unit,
          material.price.toFixed(2),
          (material.quantity * material.price).toFixed(2)
        ]);
      });

      const materialsTotal = room.materials.reduce((sum, material) => sum + (material.quantity * material.price), 0);
      roomData.push(['', '', '', 'Итого материалы:', materialsTotal.toFixed(2)]);

      roomData.push([]);
      roomData.push(['', '', '', 'ИТОГО ПО ПОМЕЩЕНИЮ:', calculateRoomTotal(room).toFixed(2)]);

      const roomSheet = XLSX.utils.aoa_to_sheet(roomData);
      XLSX.utils.book_append_sheet(workbook, roomSheet, `${index + 1}. ${room.name.substring(0, 25)}`);
    });

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
            <p className="text-muted-foreground">Создано: {formatDate(currentOffer.createdAt)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Общая сумма</p>
            <p className="text-3xl font-bold text-primary">
              {calculateOfferTotal(currentOffer).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
            </p>
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={() => exportToPDF(currentOffer)}>
                <Icon name="FileDown" size={16} className="mr-1" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportToExcel(currentOffer)}>
                <Icon name="FileSpreadsheet" size={16} className="mr-1" />
                Excel
              </Button>
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