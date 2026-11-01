import { Film, MapPin, Music, SquareCheck } from 'lucide-react-native';
import type { ListCategory } from '../lib/firebase';

export const LIST_CATEGORIES: {
  value: ListCategory;
  label: string;
  title: string;
  verb: string;
  doneLabel: string;
  Icon: typeof Film;
}[] = [
  { value: 'watch', label: 'İzle', title: 'İzlenecekler', verb: 'izlenecek', doneLabel: 'İzlendi', Icon: Film },
  { value: 'listen', label: 'Dinle', title: 'Dinlenecekler', verb: 'dinlenecek', doneLabel: 'Dinlendi', Icon: Music },
  { value: 'visit', label: 'Gez', title: 'Gidilecekler', verb: 'gidilecek', doneLabel: 'Gidildi', Icon: MapPin },
  { value: 'todo', label: 'Yap', title: 'Yapılacaklar', verb: 'yapılacak', doneLabel: 'Yapıldı', Icon: SquareCheck },
];

export const categoryInfo = (c: ListCategory) =>
  LIST_CATEGORIES.find(x => x.value === c)!;
